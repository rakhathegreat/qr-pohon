// src/components/TreeTableRow.tsx
import React from 'react';
import { TableRow as MuiTableRow, TableCell, IconButton, Tooltip } from '@mui/material';
import { Edit, Delete, QrCode } from '@mui/icons-material';
import { type Tree } from '../../types/tree';

type Props = {
  tree: Tree;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onViewQR: (id: string) => void;
};

const TableRowComponent: React.FC<Props> = ({ tree, onEdit, onDelete, onViewQR }) => {
  return (
    <MuiTableRow>
      <TableCell>{tree.common_name}</TableCell>
      <TableCell><em>{tree.scientific_name}</em></TableCell>
      <TableCell>{tree.endemic.region}</TableCell>
      <TableCell>{tree.coordinates.location}</TableCell>
      <TableCell align="center">
        <Tooltip title="Edit">
          <IconButton color="primary" onClick={() => onEdit(tree.id)}>
            <Edit />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton color="error" onClick={() => onDelete(tree.id)}>
            <Delete />
          </IconButton>
        </Tooltip>
        <Tooltip title="View QR">
          <IconButton color="secondary" onClick={() => onViewQR(tree.id)}>
            <QrCode />
          </IconButton>
        </Tooltip>
      </TableCell>
    </MuiTableRow>
  );
};

export default TableRowComponent;
