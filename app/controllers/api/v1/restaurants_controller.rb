module Api
  module V1
    class RestaurantsController < ApplicationController
       def index
        restaurants = [
          { id: 1, name: "Burger Palace", cuisine: "American" },
          { id: 2, name: "Pizza Heaven", cuisine: "Italian" },
          { id: 3, name: "Sushi World", cuisine: "Japanese" }
        ]

        render json: restaurants, status: :ok
      end

      def show
        @restaurant = Restaurant.find(params[:id])
        render json: @restaurant, status: :ok
      end
    end
  end
end
