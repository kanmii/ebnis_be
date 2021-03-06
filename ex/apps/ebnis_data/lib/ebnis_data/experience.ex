defmodule EbnisData.Experience do
  use Ecto.Schema, warn: true

  import Ecto.Changeset

  alias EbnisData.User
  alias EbnisData.Entry
  alias EbnisData.DataDefinition
  alias EbnisData.ExperienceComment
  alias EbnisData.Comment

  @always_required_fields [:title, :user_id]

  @primary_key {:id, Ecto.ULID, autogenerate: true}
  @foreign_key_type Ecto.ULID
  @timestamps_opts [type: :utc_datetime]
  schema "experiences" do
    field(:title, :string)
    field(:description, :string)
    field(:client_id, :string)
    belongs_to(:user, User)
    has_many(:entries, Entry)
    has_many(:data_definitions, DataDefinition)

    many_to_many(
      :comments,
      Comment,
      join_through: ExperienceComment
    )

    timestamps()
  end

  @doc "changeset"
  def changeset(%__MODULE__{} = schema, %{} = attrs) do
    schema
    |> cast(attrs, [
      :description,
      :title,
      :user_id,
      :client_id,
      :inserted_at,
      :updated_at
    ])
    |> cast_assoc(:data_definitions, required: false)
    |> validate_required(
      Enum.concat(
        @always_required_fields,
        attrs[:custom_requireds] || []
      )
    )
    |> unique_constraint(:title, name: :experiences_user_id_title_index)
    |> unique_constraint(:client_id, name: :experiences_client_id_user_id_index)
    |> validate_length(:title, min: 2)
    |> assoc_constraint(:user)
  end
end
