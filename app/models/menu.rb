class Menu < ApplicationRecord
  has_one_attached :image

  belongs_to :restaurant
  has_many :menu_items, -> { order(position: :asc, name: :asc) }, dependent: :destroy

  scope :active, -> { where(is_active: true) }
  scope :inactive, -> { where(is_active: false) }

  accepts_nested_attributes_for :menu_items, allow_destroy: true, reject_if: :all_blank

  validates :name, presence: true, length: { maximum: 80 }
  validates :menu_type, length: { maximum: 50 }, allow_blank: true

  def active_dishes
    menu_items.available
  end

  def available_now?(time = Time.current)
    return true unless available_from && available_until

    current_time = time.in_time_zone
    start_time = current_time.change(hour: available_from.hour, min: available_from.min)
    end_time = current_time.change(hour: available_until.hour, min: available_until.min)

    # Handles overnight menus (e.g. 6pm - 2am)
    if end_time < start_time
      current_time >= start_time || current_time <= end_time
    else
      current_time.between?(start_time, end_time)
    end
  end
end
