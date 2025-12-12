class CreateMenus < ActiveRecord::Migration[7.2]
  def change
    create_table :menus do |t|
      t.references :restaurant, null: false, foreign_key: true
      t.string :name, null: false
      t.text :description
      t.string :menu_type
      t.boolean :is_active, default: true, null: false
      t.time :available_from
      t.time :available_until

      t.timestamps
    end

    add_index :menus, [ :restaurant_id, :is_active ]
  end
end
