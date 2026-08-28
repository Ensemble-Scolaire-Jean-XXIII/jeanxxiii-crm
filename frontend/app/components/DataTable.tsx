import SortHeader from "./SortHeader";
import { useTheme } from "../contexts/ThemeContext";
import { TableSkeleton } from "./Skeleton";
import { DataTableProps } from "../types";

export default function DataTable<T>({
  data,
  columns,
  keyExtractor,
  editingId,
  editForm,
  setEditForm,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  sortField,
  sortDirection,
  onSort,
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Rechercher...",
  isLoading = false,
  hideActions = false,
  emptyMessage = "Aucun résultat trouvé.",
}: DataTableProps<T> & { emptyMessage?: string }) {
  const { t } = useTheme();

  const Actions = ({ id, item }: { id: string | number; item?: T }) => {
    if (editingId === id) {
      return (
        <div className="flex gap-1.5 justify-end">
          <button
            onClick={() => onSave(id, editForm)}
            className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 px-2.5 py-1 rounded-[calc(var(--radius-box)/2)] text-xs font-semibold cursor-pointer transition-all h-7.5 flex items-center justify-center"
          >
            Valider
          </button>
          <button
            onClick={onCancel}
            className="bg-white/5 border border-(--border-color) text-(--text-main) hover:bg-white/10 px-2.5 py-1 rounded-[calc(var(--radius-box)/2)] text-xs font-semibold cursor-pointer transition-all h-7.5 flex items-center justify-center"
          >
            Annuler
          </button>
        </div>
      );
    }
    return (
      <div className="flex justify-end gap-1.5 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={() => item && onEdit(item)}
          className="bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 px-2.5 py-1 rounded-[calc(var(--radius-box)/2)] text-xs font-semibold cursor-pointer transition-all h-7.5 flex items-center justify-center"
        >
          Modifier
        </button>
        <button
          onClick={() => onDelete(id)}
          className="bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 px-2.5 py-1 rounded-[calc(var(--radius-box)/2)] text-xs font-semibold cursor-pointer transition-all h-7.5 flex items-center justify-center"
        >
          Supprimer
        </button>
      </div>
    );
  };

  const showActionHeader = !!onSearchChange || !hideActions;
  const totalColumns = columns.length + (showActionHeader ? 1 : 0);

  return (
    <div className="w-full flex flex-col">
      <div className="hidden md:block w-full">
        <table className="w-full text-left border-collapse whitespace-nowrap text-sm table-fixed">
          <thead>
            <tr className="border-b border-(--border-color)">
              {columns.map((col, i) =>
                col.sortable && onSort ? (
                  <SortHeader
                    key={i}
                    field={col.field}
                    label={col.label as string}
                    sortField={sortField || ""}
                    sortDirection={sortDirection || "asc"}
                    onSort={onSort}
                    className={col.className}
                  />
                ) : (
                  <th
                    key={i}
                    className={`sticky top-0 z-30 px-3 py-3 font-semibold ${t.tableHeader} ${col.className || ""}`}
                  >
                    {col.label as string}
                  </th>
                ),
              )}
              {showActionHeader && (
                <th
                  className={`sticky top-0 z-30 px-3 py-3 font-semibold text-right w-52 ${t.tableHeader}`}
                >
                  {onSearchChange ? (
                    <input
                      type="text"
                      className={`${t.input} w-36 ml-auto py-1! text-xs! font-normal`}
                      placeholder={searchPlaceholder}
                      value={searchQuery || ""}
                      onChange={(e) => onSearchChange(e.target.value)}
                    />
                  ) : (
                    <span>Actions</span>
                  )}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-(--border-color)">
            {isLoading ? (
              <TableSkeleton columns={totalColumns} rows={10} />
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={totalColumns}
                  className={`p-6 text-center ${t.textMuted}`}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item) => {
                const id = keyExtractor(item);
                const isEditing = editingId === id;
                return (
                  <tr
                    key={id}
                    className={`group transition-colors ${t.tableRow} ${isEditing ? "bg-white/5" : ""}`}
                  >
                    {columns.map((col, i) => {
                      const isLast = i === columns.length - 1;
                      // Si on cache les actions mais qu'on affiche le header (barre de recherche), on étend la dernière colonne
                      const spanCols =
                        isLast && hideActions && showActionHeader ? 2 : 1;

                      return (
                        <td
                          key={i}
                          colSpan={spanCols}
                          className={`px-3 py-3.5 truncate ${col.className || ""}`}
                        >
                          {isEditing && col.renderEdit
                            ? col.renderEdit(editForm, (val) =>
                                setEditForm((prev) => ({ ...prev, ...val })),
                              )
                            : col.render(item)}
                        </td>
                      );
                    })}
                    {!hideActions && (
                      <td className="px-3 py-3.5 text-right">
                        <Actions id={id} item={item} />
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden flex flex-col gap-4">
        {onSearchChange && (
          <div className="mb-2">
            <input
              type="text"
              className={`${t.input} w-full`}
              placeholder={searchPlaceholder}
              value={searchQuery || ""}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        )}
        {isLoading ? (
          <div className={`p-4 text-center ${t.textMuted}`}>Chargement...</div>
        ) : data.length === 0 ? (
          <div className={`p-4 text-center ${t.textMuted}`}>{emptyMessage}</div>
        ) : (
          data.map((item) => {
            const id = keyExtractor(item);
            return (
              <div key={id} className={`${t.card} p-4 space-y-4`}>
                {columns.map((col, i) => (
                  <div key={i} className="flex flex-col">
                    <span className="text-xs font-semibold text-(--text-muted) mb-1">
                      {typeof col.label === "string" ? col.label : "Champ"}
                    </span>
                    <div className="text-sm truncate">
                      {editingId === id && col.renderEdit
                        ? col.renderEdit(editForm, (val) =>
                            setEditForm((prev) => ({ ...prev, ...val })),
                          )
                        : col.render(item)}
                    </div>
                  </div>
                ))}
                {!hideActions && (
                  <div className="pt-4 border-t border-(--border-color)">
                    <Actions id={id} item={item} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
