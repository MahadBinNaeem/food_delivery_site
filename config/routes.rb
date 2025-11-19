Rails.application.routes.draw do
  root "home#index"
  devise_for :admins, path: "admin"

  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      post "login", to: "auth#login"
    end
  end

  namespace :admin do
    root to: "dashboard#index"
    get "dashboard", to: "dashboard#index"
  end
end
