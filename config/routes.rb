Rails.application.routes.draw do
  root "home#index"

  namespace :api do
    namespace :v1 do
      resources :restaurants, only: [:index, :show]
    end
  end

  # Health check endpoint
  get "up" => "rails/health#show", as: :rails_health_check
end
