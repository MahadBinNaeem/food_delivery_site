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
      sample_recent_orders
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
      sample_saved_addresses
    end
  end

  def recommended_restaurants_payload
    if defined?(Restaurant)
      Restaurant.limit(4).map do |restaurant|
        {
          id: restaurant.id,
          name: restaurant.try(:name),
          cuisine: restaurant.try(:cuisine),
          rating: restaurant.try(:rating),
          eta: restaurant.try(:estimated_delivery_time),
          image_url: restaurant.try(:cover_image_url)
        }
      end
    else
      sample_recommended_restaurants
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

  def sample_recent_orders
    [
      {
        id: "FD-1207",
        restaurant: "Spice Route Kitchen",
        total: 28.95,
        status: "Out for delivery",
        eta: "15 mins",
        placed_at: 25.minutes.ago
      },
      {
        id: "FD-1206",
        restaurant: "Sushi & Co.",
        total: 42.10,
        status: "Delivered",
        eta: nil,
        placed_at: 2.days.ago
      },
      {
        id: "FD-1205",
        restaurant: "Harvest Bowl",
        total: 18.75,
        status: "Delivered",
        eta: nil,
        placed_at: 4.days.ago
      }
    ]
  end

  def sample_saved_addresses
    [
      {
        id: "home",
        label: "Home",
        street: "123 Market Street",
        city: "San Francisco, CA",
        instructions: "Ring bell and leave at the door"
      },
      {
        id: "office",
        label: "Office",
        street: "500 Mission Street",
        city: "San Francisco, CA",
        instructions: "Call when you arrive"
      }
    ]
  end

  def sample_recommended_restaurants
    [
      {
        id: "rec-1",
        name: "Coastal Thai",
        cuisine: "Thai",
        rating: 4.9,
        eta: "20-30 min",
        image_url: nil
      },
      {
        id: "rec-2",
        name: "Nori Sushi Bar",
        cuisine: "Japanese",
        rating: 4.7,
        eta: "30-40 min",
        image_url: nil
      },
      {
        id: "rec-3",
        name: "Luna Pizzeria",
        cuisine: "Italian",
        rating: 4.5,
        eta: "25-35 min",
        image_url: nil
      },
      {
        id: "rec-4",
        name: "Harvest Bowls",
        cuisine: "Healthy",
        rating: 4.8,
        eta: "15-25 min",
        image_url: nil
      }
    ]
  end
end
