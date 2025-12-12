# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2025_12_11_121754) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "admins", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_admins_on_email", unique: true
    t.index ["reset_password_token"], name: "index_admins_on_reset_password_token", unique: true
  end

  create_table "menu_items", force: :cascade do |t|
    t.bigint "menu_id", null: false
    t.string "name", null: false
    t.text "description"
    t.decimal "price", precision: 8, scale: 2, null: false
    t.string "currency", default: "PKR"
    t.string "category"
    t.string "dietary_tags"
    t.string "availability_status", default: "available"
    t.string "spice_level"
    t.integer "calories"
    t.integer "prep_time_minutes"
    t.boolean "is_available", default: true, null: false
    t.string "image_url"
    t.integer "position", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["menu_id", "is_available"], name: "index_menu_items_on_menu_id_and_is_available"
    t.index ["menu_id", "position"], name: "index_menu_items_on_menu_id_and_position"
    t.index ["menu_id"], name: "index_menu_items_on_menu_id"
  end

  create_table "menus", force: :cascade do |t|
    t.bigint "restaurant_id", null: false
    t.string "name", null: false
    t.text "description"
    t.string "menu_type"
    t.boolean "is_active", default: true, null: false
    t.time "available_from"
    t.time "available_until"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["restaurant_id", "is_active"], name: "index_menus_on_restaurant_id_and_is_active"
    t.index ["restaurant_id"], name: "index_menus_on_restaurant_id"
  end

  create_table "restaurants", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.string "name"
    t.string "contact_number"
    t.string "address"
    t.integer "status", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "description"
    t.string "cuisine_type"
    t.time "opening_time"
    t.time "closing_time"
    t.boolean "is_open", default: false
    t.integer "delivery_time_minutes"
    t.integer "pickup_time_minutes"
    t.decimal "min_order_amount", precision: 8, scale: 2
    t.decimal "delivery_fee", precision: 8, scale: 2
    t.decimal "rating", precision: 3, scale: 2, default: "0.0"
    t.integer "reviews_count", default: 0
    t.string "logo_url"
    t.string "cover_image_url"
    t.decimal "latitude", precision: 10, scale: 6
    t.decimal "longitude", precision: 10, scale: 6
    t.integer "delivery_radius_km", default: 5
    t.boolean "is_delivery_enabled", default: true
    t.boolean "is_pickup_enabled", default: true
    t.string "tags", default: [], array: true
    t.string "owner_name"
    t.string "owner_contact_number"
    t.string "owner_email"
    t.string "owner_address"
    t.index ["cuisine_type"], name: "index_restaurants_on_cuisine_type"
    t.index ["email"], name: "index_restaurants_on_email", unique: true
    t.index ["is_open"], name: "index_restaurants_on_is_open"
    t.index ["rating"], name: "index_restaurants_on_rating"
    t.index ["reset_password_token"], name: "index_restaurants_on_reset_password_token", unique: true
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.string "name"
    t.integer "role"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "jti"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["jti"], name: "index_users_on_jti"
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "menu_items", "menus"
  add_foreign_key "menus", "restaurants"
end
