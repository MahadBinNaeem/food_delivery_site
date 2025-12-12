module Restaurants
  class MenuItemsController < ApplicationController
    before_action :authenticate_restaurant!
    before_action :set_menu
    before_action :set_menu_item, only: [ :edit, :update, :destroy ]

    def new
      @menu_item = @menu.menu_items.build
    end

    def edit; end

    def create
      @menu_item = @menu.menu_items.build(menu_item_params)

      if @menu_item.save
        redirect_to restaurants_menu_path(@menu), notice: "Menu item added successfully."
      else
        render :new, status: :unprocessable_entity
      end
    end

    def update
      if @menu_item.update(menu_item_params)
        redirect_to restaurants_menu_path(@menu), notice: "Menu item updated successfully."
      else
        render :edit, status: :unprocessable_entity
      end
    end

    def destroy
      @menu_item.destroy
      redirect_to restaurants_menu_path(@menu), notice: "Menu item removed."
    end

    private

    def set_menu
      @menu = current_restaurant.menus.find(params[:menu_id])
    end

    def set_menu_item
      @menu_item = @menu.menu_items.find(params[:id])
    end

    def menu_item_params
      params.require(:menu_item).permit(
        :name,
        :description,
        :price,
        :currency,
        :category,
        :dietary_tags,
        :availability_status,
        :spice_level,
        :calories,
        :prep_time_minutes,
        :is_available,
        :image_url
      )
    end
  end
end
