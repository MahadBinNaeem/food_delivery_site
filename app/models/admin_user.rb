class AdminUser < ApplicationRecord
  # Explicitly set the table name to 'admins' to maintain compatibility
  self.table_name = 'admins'
  
  # Include default devise modules
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
         
  # Add any admin-specific methods here
  
  # Alias class method for backward compatibility
  def self.model_name
    ActiveModel::Name.new(self, nil, 'Admin')
  end
end
