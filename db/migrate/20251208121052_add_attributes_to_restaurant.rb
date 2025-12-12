class AddAttributesToRestaurant < ActiveRecord::Migration[7.2]
  def change
    add_column :restaurants, :description, :text
    add_column :restaurants, :cuisine_type, :string
    add_column :restaurants, :opening_time, :time
    add_column :restaurants, :closing_time, :time
    add_column :restaurants, :is_open, :boolean, default: false
    add_column :restaurants, :delivery_time_minutes, :integer
    add_column :restaurants, :pickup_time_minutes, :integer
    add_column :restaurants, :min_order_amount, :decimal, precision: 8, scale: 2
    add_column :restaurants, :delivery_fee, :decimal, precision: 8, scale: 2
    add_column :restaurants, :rating, :decimal, precision: 3, scale: 2, default: 0.0
    add_column :restaurants, :reviews_count, :integer, default: 0
    add_column :restaurants, :logo_url, :string
    add_column :restaurants, :cover_image_url, :string
    add_column :restaurants, :latitude, :decimal, precision: 10, scale: 6
    add_column :restaurants, :longitude, :decimal, precision: 10, scale: 6
    add_column :restaurants, :delivery_radius_km, :integer, default: 5
    add_column :restaurants, :is_delivery_enabled, :boolean, default: true
    add_column :restaurants, :is_pickup_enabled, :boolean, default: true
    add_column :restaurants, :tags, :string, array: true, default: []
    add_column :restaurants, :owner_name, :string
    add_column :restaurants, :owner_contact_number, :string
    add_column :restaurants, :owner_email, :string
    add_column :restaurants, :owner_address, :string

    add_index :restaurants, :cuisine_type
    add_index :restaurants, :is_open
    add_index :restaurants, :rating
  end
end
