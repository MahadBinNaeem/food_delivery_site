class Restaurants::DashboardController < ApplicationController
  before_action :authenticate_restaurant!

  def index
    payload = dashboard_payload

    respond_to do |format|
      format.html { @dashboard_data = payload }
      format.json { render json: payload }
    end
  end

  private

  def dashboard_payload
    {
      restaurant: restaurant_info,
      sales: sales_data,
      orders: orders_data,
      metrics: metrics_data,
      recent_orders: recent_orders_data,
      top_items: top_items_data
    }
  end

  def restaurant_info
    {
      id: current_restaurant.id,
      name: current_restaurant.name,
      email: current_restaurant.email,
      contact_number: current_restaurant.contact_number,
      address: current_restaurant.address,
      status: current_restaurant.status,
      joined_at: current_restaurant.created_at
    }
  end

  def sales_data
    today_sales = calculate_sales_for_period(Date.today.beginning_of_day, Date.today.end_of_day)
    week_sales = calculate_sales_for_period(Date.today.beginning_of_week, Date.today.end_of_week)
    month_sales = calculate_sales_for_period(Date.today.beginning_of_month, Date.today.end_of_month)

    {
      today: today_sales,
      this_week: week_sales,
      this_month: month_sales,
      weekly_trend: calculate_weekly_trend,
      monthly_trend: calculate_monthly_trend
    }
  end

  def orders_data
    return default_orders_data unless defined?(Order)

    orders_relation = Order.where(restaurant_id: current_restaurant.id)

    {
      pending: orders_relation.where(status: 'pending').count,
      preparing: orders_relation.where(status: 'preparing').count,
      ready: orders_relation.where(status: 'ready').count,
      out_for_delivery: orders_relation.where(status: 'out_for_delivery').count,
      completed_today: orders_relation.where(status: 'completed', created_at: Date.today.beginning_of_day..Date.today.end_of_day).count,
      cancelled_today: orders_relation.where(status: 'cancelled', created_at: Date.today.beginning_of_day..Date.today.end_of_day).count
    }
  rescue StandardError
    default_orders_data
  end

  def metrics_data
    return default_metrics_data unless defined?(Order)

    orders_relation = Order.where(restaurant_id: current_restaurant.id)
    total_orders = orders_relation.count
    total_revenue = orders_relation.sum(:total_amount).to_f
    avg_order_value = total_orders.positive? ? (total_revenue / total_orders).round(2) : 0.0
    completed_orders = orders_relation.where(status: 'completed').count
    completion_rate = total_orders.positive? ? ((completed_orders.to_f / total_orders) * 100).round(1) : 0.0

    {
      total_orders: total_orders,
      total_revenue: total_revenue,
      average_order_value: avg_order_value,
      customer_rating: current_restaurant.try(:rating).to_f,
      completion_rate: completion_rate,
      average_prep_time: calculate_average_prep_time
    }
  rescue StandardError
    default_metrics_data
  end

  def recent_orders_data
    return [] unless defined?(Order)

    Order.where(restaurant_id: current_restaurant.id)
         .order(created_at: :desc)
         .limit(10)
         .map do |order|
      {
        id: order.id,
        customer_name: order.try(:customer_name) || order.try(:user)&.name || "Customer",
        items: format_order_items(order),
        total: order.try(:total_amount).to_f,
        status: order.status,
        placed_at: order.created_at
      }
    end
  rescue StandardError
    []
  end

  def top_items_data
    return [] unless defined?(Order) && defined?(OrderItem)

    OrderItem.joins(:order)
             .where(orders: { restaurant_id: current_restaurant.id, status: 'completed' })
             .group(:menu_item_id)
             .select('menu_item_id, COUNT(*) as order_count, SUM(quantity * price) as total_revenue')
             .order('order_count DESC')
             .limit(5)
             .map do |item|
      {
        name: item.try(:menu_item)&.name || "Item ##{item.menu_item_id}",
        orders: item.order_count,
        revenue: item.total_revenue.to_f
      }
    end
  rescue StandardError
    []
  end

  def calculate_sales_for_period(start_time, end_time)
    return 0.0 unless defined?(Order)

    Order.where(restaurant_id: current_restaurant.id, status: 'completed', created_at: start_time..end_time)
         .sum(:total_amount)
         .to_f
  rescue StandardError
    0.0
  end

  def calculate_weekly_trend
    return [] unless defined?(Order)

    (6.days.ago.to_date..Date.today).map do |date|
      {
        day: date.strftime('%a'),
        sales: calculate_sales_for_period(date.beginning_of_day, date.end_of_day)
      }
    end
  rescue StandardError
    []
  end

  def calculate_monthly_trend
    return [] unless defined?(Order)

    (5.months.ago.beginning_of_month..Date.today).group_by { |d| d.beginning_of_month }.map do |month, _|
      {
        month: month.strftime('%b'),
        sales: calculate_sales_for_period(month.beginning_of_month, month.end_of_month)
      }
    end
  rescue StandardError
    []
  end

  def calculate_average_prep_time
    return 0 unless defined?(Order)

    orders_with_prep_time = Order.where(restaurant_id: current_restaurant.id, status: 'completed')
                                 .where.not(prepared_at: nil)

    return 0 if orders_with_prep_time.empty?

    total_prep_time = orders_with_prep_time.sum { |order|
      (order.prepared_at - order.created_at).to_i / 60 rescue 0
    }

    (total_prep_time / orders_with_prep_time.count).round
  rescue StandardError
    0
  end

  def format_order_items(order)
    return "Order items" unless order.respond_to?(:order_items)

    items = order.order_items.map do |item|
      "#{item.quantity}x #{item.try(:menu_item)&.name || 'Item'}"
    end.join(", ")

    items.presence || "Order items"
  rescue StandardError
    "Order items"
  end

  def default_orders_data
    {
      pending: 0,
      preparing: 0,
      ready: 0,
      out_for_delivery: 0,
      completed_today: 0,
      cancelled_today: 0
    }
  end

  def default_metrics_data
    {
      total_orders: 0,
      total_revenue: 0.0,
      average_order_value: 0.0,
      customer_rating: 0.0,
      completion_rate: 0.0,
      average_prep_time: 0
    }
  end
end
