class Admin::DashboardController < Admin::BaseController
  def index
    @stats = dashboard_stats

    respond_to do |format|
      format.html
      format.json { render json: @stats }
    end
  end

  private

  def dashboard_stats
    {
      total_customers: count_for_role(:customer),
      total_restaurants: count_for_role(:vendor),
      total_riders: count_for_role(:rider),
      total_orders: orders_count,
      recent_orders: recent_orders_payload,
      recent_users: recent_users_payload
    }
  end

  def count_for_role(role)
    return 0 unless User.respond_to?(role)

    User.public_send(role).count
  end

  def orders_count
    defined?(Order) ? Order.count : 0
  end

  def recent_orders_payload
    return [] unless defined?(Order)

    Order.order(created_at: :desc).limit(5).map do |order|
      {
        id: order.id,
        status: order.try(:status),
        total_amount: order.try(:total_amount),
        placed_at: order.try(:created_at)
      }
    end
  end

  def recent_users_payload
    User.order(created_at: :desc).limit(5).map do |user|
      {
        id: user.id,
        name: user.try(:name),
        email: user.email,
        role: user.role
      }
    end
  end
end
