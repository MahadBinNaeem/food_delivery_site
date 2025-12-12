class DashboardController < ApplicationController
  before_action :authenticate_user!, except: :index
  def index
    payload = dashboard_payload

    respond_to do |format|
      format.html { @dashboard_data = payload }
      format.json { render json: payload }
    end
  end

  private

  def dashboard_payload
    recommended = recommended_restaurants_payload

    {
      user: user_payload,
      stats: stats_payload(recommended),
      recent_orders: recent_orders_payload,
      saved_addresses: saved_addresses_payload,
      recommended_restaurants: recommended,
      featured_dishes: featured_dishes_payload,
      quick_actions: quick_actions_payload,
      auth_paths: auth_paths_payload
    }
  end

  def user_payload
    return {} unless current_user

    {
      id: current_user.id,
      name: current_user.name.presence || current_user.email,
      email: current_user.email,
      role: current_user.role,
      joined_at: current_user.created_at
    }
  end

  def stats_payload(recommended_restaurants)
    {
      upcoming_deliveries: fetch_order_count([ "preparing", "pending", "out_for_delivery" ]),
      completed_orders: fetch_order_count([ "completed", "delivered" ]),
      favorite_restaurants: favorite_restaurants_count(recommended_restaurants),
      loyalty_points: current_user.try(:loyalty_points).to_i
    }
  end

  def fetch_order_count(statuses)
    return 0 unless can_query_orders?

    relation = current_user.orders
    relation = relation.where(status: statuses) if relation.respond_to?(:where)
    relation.count
  rescue StandardError
    0
  end

  def favorite_restaurants_count(recommended_restaurants)
    return 0 unless current_user

    if current_user.respond_to?(:favorite_restaurants)
      current_user.favorite_restaurants.count
    else
      recommended_restaurants.count
    end
  end

  def recent_orders_payload
    return [] unless current_user

    if can_query_orders?
      current_user.orders.order(created_at: :desc).limit(5).map do |order|
        {
          id: order.id,
          restaurant: order.try(:restaurant_name) || order.try(:restaurant)&.try(:name),
          total: order.try(:total_amount),
          status: order.try(:status),
          eta: order.try(:estimated_delivery_time),
          placed_at: order.try(:created_at)
        }
      end
    else
      []
    end
  end

  def saved_addresses_payload
    return [] unless current_user

    if current_user.respond_to?(:saved_addresses)
      current_user.saved_addresses.map do |address|
        {
          id: address.id,
          label: address.try(:label) || address.try(:tag),
          street: address.try(:street_line) || address.try(:street),
          city: address.try(:city),
          instructions: address.try(:instructions)
        }
      end
    else
      []
    end
  end

  def recommended_restaurants_payload
    if defined?(Restaurant)
      Restaurant.includes(menus: :menu_items).limit(4).map do |restaurant|
        {
          id: restaurant.id,
          name: restaurant.try(:name),
          cuisine: restaurant.try(:cuisine_type) || restaurant.try(:cuisine),
          rating: restaurant.try(:rating),
          eta: delivery_eta_for(restaurant),
          image_url: restaurant.try(:cover_image_url),
          path: helpers.restaurant_path(restaurant),
          signature_dishes: restaurant.menu_items.available.limit(3).map do |item|
            {
              id: item.id,
              name: item.name,
              price: item.price,
              currency: item.currency
            }
          end
        }
      end
    else
      []
    end
  end

  def featured_dishes_payload
    if defined?(MenuItem)
      MenuItem.available.includes(menu: :restaurant).order(created_at: :desc).limit(6).map do |item|
        {
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          currency: item.currency,
          image_url: item.image_url,
          restaurant_name: item.restaurant&.name,
          restaurant_id: item.restaurant&.id,
          restaurant_path: item.restaurant.present? ? helpers.restaurant_path(item.restaurant) : nil
        }
      end
    else
      []
    end
  end

  def quick_actions_payload
    [
      {
        id: "order-again",
        label: "Order again",
        description: "Reorder your recent favourites",
        href: dashboard_path(anchor: "order-again")
      },
      {
        id: "track",
        label: "Track delivery",
        description: "Follow an active delivery in real time",
        href: dashboard_path(anchor: "track")
      },
      {
        id: "support",
        label: "Chat with support",
        description: "Need help with an order? We're here.",
        href: dashboard_path(anchor: "support")
      }
    ]
  end

  def auth_paths_payload
    {
      login: helpers.new_user_session_path,
      signup: helpers.new_user_registration_path,
      logout: helpers.destroy_user_session_path,
      restaurant_signup: helpers.new_restaurant_registration_path
    }
  end

  def can_query_orders?
    defined?(Order) && current_user&.respond_to?(:orders)
  end

  def delivery_eta_for(restaurant)
    if restaurant.try(:delivery_time_minutes).present?
      "#{restaurant.delivery_time_minutes} min"
    elsif restaurant.try(:pickup_time_minutes).present?
      "#{restaurant.pickup_time_minutes} min"
    else
      restaurant.try(:estimated_delivery_time)
    end
  end
end
