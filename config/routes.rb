Rails.application.routes.draw do
  devise_for :admins, path: "admin"
  devise_for :restaurants, path: "restaurants", controllers: {
    registrations: 'restaurants/registrations',
    sessions: 'restaurants/sessions'
  }
  devise_for :users, controllers: {
    registrations: 'users/registrations'
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
  end

  namespace :admin do
    root to: "dashboard#index"
    get "dashboard", to: "dashboard#index"

    resources :users
    resources :restaurants
    resources :orders
  end
end
