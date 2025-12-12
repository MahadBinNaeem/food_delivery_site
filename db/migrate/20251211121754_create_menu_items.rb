class CreateMenuItems < ActiveRecord::Migration[7.2]
  def change
    create_table :menu_items do |t|
      t.references :menu, null: false, foreign_key: true
      t.string :name, null: false
      t.text :description
      t.decimal :price, precision: 8, scale: 2, null: false
      t.string :currency, default: "PKR"
      t.string :category
      t.string :dietary_tags
      t.string :availability_status, default: "available"
      t.string :spice_level
      t.integer :calories
      t.integer :prep_time_minutes
      t.boolean :is_available, default: true, null: false
      t.string :image_url
      t.integer :position, default: 0, null: false

      t.timestamps
    end

    add_index :menu_items, [ :menu_id, :is_available ]
    add_index :menu_items, [ :menu_id, :position ]
  end
end
