module Restaurants
  class MenusController < ApplicationController
    before_action :authenticate_restaurant!
    before_action :set_menu, only: [ :show, :edit, :update, :destroy ]

    def index
      @menus = current_restaurant.menus.includes(:menu_items).order(created_at: :desc)

      respond_to do |format|
        format.html
        format.json { render json: menus_payload(@menus) }
      end
    end

    def show
      respond_to do |format|
        format.html
        format.json { render json: menu_payload(@menu) }
      end
    end

    def new
      @menu = current_restaurant.menus.build
    end

    def edit; end

    def create
      @menu = current_restaurant.menus.build(menu_params)

      if @menu.save
        redirect_to restaurants_menu_path(@menu), notice: "Menu created successfully."
      else
        render :new, status: :unprocessable_entity
      end
    end

    def update
      if @menu.update(menu_params)
        redirect_to restaurants_menu_path(@menu), notice: "Menu updated successfully."
      else
        render :edit, status: :unprocessable_entity
      end
    end

    def destroy
      @menu.destroy
      redirect_to restaurants_menus_path, notice: "Menu deleted successfully."
    end

    private

    def set_menu
      @menu = current_restaurant.menus.find(params[:id])
    end

    def menu_params
      params.require(:menu).permit(
        :name,
        :description,
        :menu_type,
        :is_active,
        :available_from,
        :available_until
      )
    end

    def menus_payload(menus)
      menus.map { |menu| menu_payload(menu) }
    end

    def menu_payload(menu)
      {
        id: menu.id,
        name: menu.name,
        description: menu.description,
        menu_type: menu.menu_type,
        is_active: menu.is_active,
        available_from: menu.available_from,
        available_until: menu.available_until,
        items: menu.menu_items.order(position: :asc).map do |item|
          {
            id: item.id,
            name: item.name,
            price: item.price.to_f,
            currency: item.currency,
            category: item.category,
            availability_status: item.availability_status,
            is_available: item.is_available
          }
        end
      }
    end
  end
end
