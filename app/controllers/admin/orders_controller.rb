module Admin
  class OrdersController < BaseController
    before_action :set_order, only: [ :show, :update, :destroy ]

    def index
      authorize :admin, :manage_orders?
      @orders = Order.all.order(created_at: :desc)
      render json: @orders
    end

    def show
      authorize :admin, :manage_orders?
      render json: @order
    end

    def update
      authorize :admin, :manage_orders?
      if @order.update(order_params)
        render json: @order
      else
        render json: { errors: @order.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def destroy
      authorize :admin, :manage_orders?
      @order.destroy
      render json: { message: "Order deleted successfully" }
    end

    private

    def set_order
      @order = Order.find(params[:id])
    end

    def order_params
      params.require(:order).permit(:status, :assigned_rider_id, :total_amount)
    end
  end
end
