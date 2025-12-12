class Restaurants::RegistrationsController < Devise::RegistrationsController
  before_action :configure_sign_up_params, only: [ :create ]
  before_action :configure_account_update_params, only: [ :update ]

  respond_to :html, :json

  def create
    build_resource(sign_up_params)

    resource.save
    yield resource if block_given?

    if resource.persisted?
      if resource.active_for_authentication?
        set_flash_message! :notice, :signed_up
        sign_up(resource_name, resource)
        respond_to do |format|
          format.html { redirect_to after_sign_up_path_for(resource) }
          format.json { render json: { redirect_url: after_sign_up_path_for(resource), message: "Registration successful" }, status: :created }
        end
      else
        set_flash_message! :notice, :"signed_up_but_#{resource.inactive_message}"
        expire_data_after_sign_in!
        respond_to do |format|
          format.html { redirect_to after_inactive_sign_up_path_for(resource) }
          format.json { render json: { redirect_url: after_inactive_sign_up_path_for(resource), message: "Registration successful but account is inactive" }, status: :created }
        end
      end
    else
      clean_up_passwords resource
      set_minimum_password_length
      respond_to do |format|
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: { errors: resource.errors.full_messages }, status: :unprocessable_entity }
      end
    end
  end

  protected

  def configure_sign_up_params
    devise_parameter_sanitizer.permit(:sign_up, keys: [
      :name, :contact_number, :address,
      :owner_name, :owner_email, :owner_contact_number,
      :description, :cuisine_type, :opening_time, :closing_time,
      :delivery_time_minutes, :pickup_time_minutes,
      :min_order_amount, :delivery_fee, :delivery_radius_km,
      :is_delivery_enabled, :is_pickup_enabled,
      tags: []
    ])
  end

  def configure_account_update_params
    devise_parameter_sanitizer.permit(:account_update, keys: [ :name, :contact_number, :address ])
  end

  def after_sign_up_path_for(resource)
    restaurants_root_path
  end
end
