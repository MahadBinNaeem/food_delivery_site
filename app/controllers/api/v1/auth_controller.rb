class Api::V1::AuthController < ApplicationController
  protect_from_forgery with: :null_session
  skip_before_action :verify_authenticity_token

  def login
    user = User.find_by(email: params[:email])

    if user&.valid_password?(params[:password])
      token = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first
      render json: {
        token:,
        user: user.as_json(only: [ :id, :email, :role, :name ]),
        redirect_to: restaurants_path
      }
    else
      render json: { error: "Invalid credentials" }, status: :unauthorized
    end
  end
end
