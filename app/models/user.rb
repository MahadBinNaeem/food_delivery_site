class User < ApplicationRecord
  enum role: { vendor: 0, customer: 1, rider: 2 }

  include Devise::JWT::RevocationStrategies::JTIMatcher
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :jwt_authenticatable,
         jwt_revocation_strategy: self
end
