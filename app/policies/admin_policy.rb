class AdminPolicy < ApplicationPolicy
  def index?
    user.is_a?(Admin)
  end

  def manage_restaurants?
    user.is_a?(Admin)
  end

  def manage_users?
    user.is_a?(Admin)
  end

  def manage_orders?
    user.is_a?(Admin)
  end

  def view_dashboard?
    user.is_a?(Admin)
  end

  def view_revenue?
    user.is_a?(Admin)
  end

  class Scope < Scope
    def resolve
      if user.is_a?(Admin)
        scope.all
      else
        scope.none
      end
    end
  end
end
