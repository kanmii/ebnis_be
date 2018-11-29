defmodule Ebnis.Repo.Migrations.CreateExperienceFields do
  use Ecto.Migration

  def change do
    create table(:exp_fields, primary_key: false) do
      add(:id, :binary_id, primary_key: true, comment: "Primary key")

      add(
        :experience_id,
        references(:experiences, type: :binary_id, on_delete: :delete_all),
        null: false,
        comment: "Experience to which the field belongs"
      )

      add(:name, :citext, comment: "E.g sleep")

      # FIELD TYPES OF EXPERIENCE

      add(:single_line_text, :string, comment: "Single like text field")
      add(:multi_line_text, :text, comment: "Multi line text field")
      add(:integer, :integer)
      add(:decimal, :float)
      add(:date, :float)
      add(:datetime, :utc_datetime)
    end

    :exp_fields
    |> index([:experience_id])
    |> create()

    :exp_fields
    |> unique_index([:experience_id, :name])
    |> create()

    :exp_fields
    |> constraint(
      :exact_one_field_type_non_null,
      check: """
      (CASE WHEN single_line_text IS NULL THEN 0 ELSE 1 END) +
      (CASE WHEN multi_line_text IS NULL THEN 0 ELSE 1 END) +
      (CASE WHEN integer IS NULL THEN 0 ELSE 1 END) +
      (CASE WHEN decimal IS NULL THEN 0 ELSE 1 END) +
      (CASE WHEN date IS NULL THEN 0 ELSE 1 END) +
      (CASE WHEN datetime IS NULL THEN 0 ELSE 1 END) = 1
      """
    )
    |> create()
  end
end
