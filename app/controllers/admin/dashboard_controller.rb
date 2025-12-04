class Admin::DashboardController < Admin::BaseController
  def index
    @stats = dashboard_stats

    respond_to do |format|
      format.html { @dashboard_data = @stats }
      format.json { render json: @stats }
    end
  end

  private

  def dashboard_stats
    {
      overview: overview_stats,
      users: users_stats,
      restaurants: restaurants_stats,
      orders: orders_stats,
      revenue: revenue_stats,
      recent_activity: recent_activity_payload,
      platform_metrics: platform_metrics,
      auth_paths: auth_paths_payload
    }
  end

  def overview_stats
    {
      total_users: User.count,
      total_restaurants: restaurant_count,
      total_orders: orders_count,
      total_revenue: total_revenue
    }
  end

  def users_stats
    {
      total: User.count,
      customers: count_for_role(:customer),
      vendors: count_for_role(:vendor),
      riders: count_for_role(:rider),
      new_today: User.where('created_at >= ?', Date.today.beginning_of_day).count,
      new_this_week: User.where('created_at >= ?', Date.today.beginning_of_week).count,
      new_this_month: User.where('created_at >= ?', Date.today.beginning_of_month).count
    }
  end

  def restaurants_stats
    return default_restaurant_stats unless defined?(Restaurant)

    {
      total: Restaurant.count,
      pending: Restaurant.where(status: 'pending').count,
      approved: Restaurant.where(status: 'approved').count,
      suspended: Restaurant.where(status: 'suspended').count,
      new_today: Restaurant.where('created_at >= ?', Date.today.beginning_of_day).count,
      new_this_week: Restaurant.where('created_at >= ?', Date.today.beginning_of_week).count
    }
  rescue StandardError
    default_restaurant_stats
  end

  def orders_stats
    return default_orders_stats unless defined?(Order)

    {
      total: Order.count,
      pending: Order.where(status: 'pending').count,
      preparing: Order.where(status: 'preparing').count,
      out_for_delivery: Order.where(status: 'out_for_delivery').count,
      completed: Order.where(status: 'completed').count,
      cancelled: Order.where(status: 'cancelled').count,
      today: Order.where('created_at >= ?', Date.today.beginning_of_day).count,
      this_week: Order.where('created_at >= ?', Date.today.beginning_of_week).count,
      this_month: Order.where('created_at >= ?', Date.today.beginning_of_month).count
    }
  rescue StandardError
    default_orders_stats
  end

  def revenue_stats
    return default_revenue_stats unless defined?(Order)

    {
      total: Order.sum(:total_amount).to_f,
      today: Order.where('created_at >= ?', Date.today.beginning_of_day).sum(:total_amount).to_f,
      this_week: Order.where('created_at >= ?', Date.today.beginning_of_week).sum(:total_amount).to_f,
      this_month: Order.where('created_at >= ?', Date.today.beginning_of_month).sum(:total_amount).to_f,
      average_order_value: calculate_average_order_value,
      trend: calculate_revenue_trend
    }
  rescue StandardError
    default_revenue_stats
  end

  def platform_metrics
    {
      user_growth_rate: calculate_growth_rate(User, 'this_month'),
      restaurant_growth_rate: calculate_restaurant_growth_rate,
      order_completion_rate: calculate_order_completion_rate,
      average_delivery_time: calculate_average_delivery_time
    }
  end

  def recent_activity_payload
    {
      recent_orders: recent_orders_payload,
      recent_users: recent_users_payload,
      recent_restaurants: recent_restaurants_payload
    }
  end

  def recent_orders_payload
    return [] unless defined?(Order)

    Order.order(created_at: :desc).limit(10).map do |order|
      {
        id: order.id,
        customer: order.try(:user)&.name || order.try(:user)&.email || "Customer",
        restaurant: order.try(:restaurant)&.name || "Restaurant",
        status: order.status,
        total_amount: order.try(:total_amount).to_f,
        placed_at: order.created_at
      }
    end
  rescue StandardError
    []
  end

  def recent_users_payload
    User.order(created_at: :desc).limit(10).map do |user|
      {
        id: user.id,
        name: user.try(:name) || user.email,
        email: user.email,
        role: user.role,
        joined_at: user.created_at
      }
    end
  end

  def recent_restaurants_payload
    return [] unless defined?(Restaurant)

    Restaurant.order(created_at: :desc).limit(10).map do |restaurant|
      {
        id: restaurant.id,
        name: restaurant.name,
        email: restaurant.email,
        status: restaurant.status,
        joined_at: restaurant.created_at
      }
    end
  rescue StandardError
    []
  end

  def count_for_role(role)
    return 0 unless User.respond_to?(role)

    User.public_send(role).count
  end

  def restaurant_count
    defined?(Restaurant) ? Restaurant.count : 0
  end

  def orders_count
    defined?(Order) ? Order.count : 0
  end

  def total_revenue
    return 0.0 unless defined?(Order)

    Order.sum(:total_amount).to_f
  rescue StandardError
    0.0
  end

  def calculate_average_order_value
    return 0.0 unless defined?(Order)

    total = Order.count
    return 0.0 if total.zero?

    (Order.sum(:total_amount).to_f / total).round(2)
  rescue StandardError
    0.0
  end

  def calculate_revenue_trend
    return [] unless defined?(Order)

    (6.days.ago.to_date..Date.today).map do |date|
      {
        date: date.strftime('%b %d'),
        revenue: Order.where(created_at: date.beginning_of_day..date.end_of_day).sum(:total_amount).to_f
      }
    end
  rescue StandardError
    []
  end

  def calculate_growth_rate(model, period)
    return 0.0 unless model

    case period
    when 'this_month'
      current = model.where('created_at >= ?', Date.today.beginning_of_month).count
      previous = model.where(created_at: 1.month.ago.beginning_of_month..1.month.ago.end_of_month).count
    when 'this_week'
      current = model.where('created_at >= ?', Date.today.beginning_of_week).count
      previous = model.where(created_at: 1.week.ago.beginning_of_week..1.week.ago.end_of_week).count
    else
      return 0.0
    end

    return 0.0 if previous.zero?

    (((current - previous).to_f / previous) * 100).round(1)
  rescue StandardError
    0.0
  end

  def calculate_restaurant_growth_rate
    return 0.0 unless defined?(Restaurant)

    calculate_growth_rate(Restaurant, 'this_month')
  end

  def calculate_order_completion_rate
    return 0.0 unless defined?(Order)

    total = Order.count
    return 0.0 if total.zero?

    completed = Order.where(status: 'completed').count
    ((completed.to_f / total) * 100).round(1)
  rescue StandardError
    0.0
  end

  def calculate_average_delivery_time
    return 0 unless defined?(Order)

    completed_orders = Order.where(status: 'completed').where.not(delivered_at: nil)
    return 0 if completed_orders.empty?

    total_time = completed_orders.sum { |order|
      (order.delivered_at - order.created_at).to_i / 60 rescue 0
    }

    (total_time / completed_orders.count).round
  rescue StandardError
    0
  end

  def default_restaurant_stats
    { total: 0, pending: 0, approved: 0, suspended: 0, new_today: 0, new_this_week: 0 }
  end

  def default_orders_stats
    { total: 0, pending: 0, preparing: 0, out_for_delivery: 0, completed: 0, cancelled: 0, today: 0, this_week: 0, this_month: 0 }
  end

  def default_revenue_stats
    { total: 0.0, today: 0.0, this_week: 0.0, this_month: 0.0, average_order_value: 0.0, trend: [] }
  end

  def auth_paths_payload
    {
      logout: helpers.destroy_admin_session_path
    }
  end
end
