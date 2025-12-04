class Restaurant < ApplicationRecord
  enum status: { pending: 0, approved: 1, suspended: 2 }

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
end
