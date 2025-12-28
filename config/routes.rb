Rails.application.routes.draw do
  devise_for :admin_users, path: "admin", class_name: "AdminUser"
  devise_for :restaurants, path: "restaurants", controllers: {
    registrations: "restaurants/registrations",
    sessions: "restaurants/sessions"
  }
  devise_for :users, controllers: {
    registrations: "users/registrations"
  }
  root "dashboard#index"
  get "dashboard", to: "dashboard#index"

  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      post "login", to: "auth#login"
    end
  end

  namespace :restaurants do
    root to: "dashboard#index"
    get "dashboard", to: "dashboard#index"

    resources :menus do
      resources :menu_items, except: :index
    end
  end

  namespace :admin do
    root to: "dashboard#index"
    get "dashboard", to: "dashboard#index"

    resources :users
    resources :restaurants do
      member do
        patch :approve
      end
    end
    resources :orders
  end

  resources :restaurants, only: :show
end
