# frozen_string_literal: true

class DeviseCreateRestaurants < ActiveRecord::Migration[7.2]
  def change
    create_table :restaurants do |t|
      ## Database authenticatable
      t.string :email,              null: false, default: ""
      t.string :encrypted_password, null: false, default: ""

      ## Recoverable
      t.string   :reset_password_token
      t.datetime :reset_password_sent_at

      ## Rememberable
      t.datetime :remember_created_at

      t.string :name
      t.string :contact_number
      t.string :address
      t.integer :status, default: 0

      t.timestamps null: false
    end

    add_index :restaurants, :email,                unique: true
    add_index :restaurants, :reset_password_token, unique: true
  end
end
