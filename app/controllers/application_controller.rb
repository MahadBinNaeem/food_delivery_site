class ApplicationController < ActionController::Base
  include Pundit

  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

  protected

  def after_sign_in_path_for(resource)
    return admin_dashboard_path if resource.is_a?(Admin)

    super
  end

  def after_sign_out_path_for(resource_or_scope)
    if resource_or_scope == :admin || resource_or_scope.is_a?(Admin)
      new_admin_session_path
    else
      super
    end
  end

  private

  def user_not_authorized
    flash[:alert] = "You are not authorized to perform this action."
    redirect_to(request.referrer || root_path)
  end
end
