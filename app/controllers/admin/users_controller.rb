module Admin
  class UsersController < BaseController
    before_action :set_user, only: [ :show, :update, :destroy ]

    def index
      authorize :admin, :manage_users?
      @users = User.all
      render json: @users
    end

    def show
      authorize :admin, :manage_users?
      render json: @user
    end

    def update
      authorize :admin, :manage_users?
      if @user.update(user_params)
        render json: @user
      else
        render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def destroy
      authorize :admin, :manage_users?
      @user.destroy
      render json: { message: "User deleted successfully" }
    end

    private

    def set_user
      @user = User.find(params[:id])
    end

    def user_params
      params.require(:user).permit(:name, :email, :status)
    end
  end
end
