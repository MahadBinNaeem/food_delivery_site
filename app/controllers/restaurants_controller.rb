class RestaurantsController < ApplicationController
  def show
    @restaurant = Restaurant.includes(menus: :menu_items).find(params[:id])
    @menus = @restaurant.menus.includes(:menu_items).order(:name)
    @highlighted_dishes = @restaurant.menu_items.available.includes(:menu).limit(8)
  end
end
