'use client';

import * as React from 'react';
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  flexRender,
} from '@tanstack/react-table';

import { Button } from 'components/atoms/Button';
import { Card } from 'components/atoms/Card';
import { ArrowLeft, ArrowRight } from 'lucide-react';

type Props<TData> = {
  title: string;
  data: TData[];
  columns: ColumnDef<TData, any>[];
  loading?: boolean;
  headerAction?: React.ReactNode;
};

export function DataTable<TData extends { id: string }>({
  title,
  data,
  columns,
  loading = false,
  headerAction,
}: Props<TData>) {
  const table = useReactTable<TData>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Card className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">{title}</h1>
        {headerAction ? <div>{headerAction}</div> : null}
      </div>

      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-muted text-muted-foreground">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-2 text-left">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              [...Array(3)].map((_, idx) => (
                <tr key={idx} className="border-t animate-pulse">
                  {columns.map((_, i) => (
                    <td key={i} className="px-4 py-3">
                      <div className="h-4 bg-gray-200 rounded w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-6 text-gray-500"
                >
                  Tidak ada data tersedia.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t hover:bg-accent/20">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && data.length > 0 && (
        <div className="flex justify-between items-center pt-4">
          <Button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            variant="secondary"
            className="h-9 px-3 text-sm inline-flex items-center gap-1 bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-200 disabled:text-gray-400"
          >
            <ArrowLeft size={16} />
            <span>Sebelumnya</span>
          </Button>
          <span className="text-sm">
            Halaman {table.getState().pagination.pageIndex + 1} dari{' '}
            {table.getPageCount()}
          </span>
          <Button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            variant="secondary"
            className="h-9 px-3 text-sm inline-flex items-center gap-1 bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-200 disabled:text-gray-400"
          >
            <span>Selanjutnya</span>
            <ArrowRight size={16} />
          </Button>
        </div>
      )}
    </Card>
  );
}
