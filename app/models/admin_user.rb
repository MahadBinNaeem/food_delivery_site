class AdminUser < ApplicationRecord
  self.table_name = "admins"

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  def self.model_name
    ActiveModel::Name.new(self, nil, "Admin")
  end
end
