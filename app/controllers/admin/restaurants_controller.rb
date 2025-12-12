class Admin::RestaurantsController < Admin::BaseController
  before_action :set_restaurant, only: [ :show, :update, :destroy, :approve ]

  def index
    authorize :admin, :manage_restaurants?
    @restaurants = Restaurant.all
  end

  def show
    authorize :admin, :manage_restaurants?
    render json: @restaurant
  end

  def approve
    authorize :admin, :manage_restaurants?
    debugger
    if @restaurant.update(status: params[:status])
      redirect_to admin_restaurants_path, notice: "Restaurant approved successfully"
    else
      redirect_to admin_restaurants_path, alert: "Failed to approve restaurant"
    end
  end

  def update
    authorize :admin, :manage_restaurants?
    if @restaurant.update(restaurant_params)
      render json: @restaurant
    else
      render json: { errors: @restaurant.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    authorize :admin, :manage_restaurants?
    @restaurant.destroy
    render json: { message: "Restaurant deleted successfully" }
  end

  private

  def set_restaurant
    debugger
    @restaurant = Restaurant.find(params[:id])
  end

  def restaurant_params
    params.require(:user).permit(:name, :email, :status, :restaurant_type)
  end
end
