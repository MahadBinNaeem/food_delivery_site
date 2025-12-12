class MenuItem < ApplicationRecord
  AVAILABILITY_STATUSES = {
    available: "available",
    sold_out: "sold_out",
    hidden: "hidden"
  }.freeze

  belongs_to :menu

  delegate :restaurant, to: :menu

  enum availability_status: AVAILABILITY_STATUSES, _suffix: true

  before_validation :ensure_position

  scope :available, -> { where(is_available: true).where(availability_status: AVAILABILITY_STATUSES[:available]) }
  scope :visible, -> { where.not(availability_status: AVAILABILITY_STATUSES[:hidden]) }

  validates :name, presence: true, length: { maximum: 120 }
  validates :price, presence: true,
                    numericality: { greater_than_or_equal_to: 0, less_than: 10_000 }
  validates :availability_status, inclusion: { in: AVAILABILITY_STATUSES.values }

  def dietary_tags_list
    return [] if dietary_tags.blank?

    dietary_tags.split(",").map(&:strip)
  end

  def mark_sold_out!
    update!(is_available: false, availability_status: AVAILABILITY_STATUSES[:sold_out])
  end

  private

  def ensure_position
    return if position.present? || menu.blank?

    self.position = (menu.menu_items.maximum(:position) || 0) + 1
  end
end
