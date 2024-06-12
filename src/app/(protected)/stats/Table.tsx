import ProgressBar from '@/components/ProgressBar';
import React, { memo } from 'react';
import numeral from 'numeral';

const Table = memo(
  ({
    data,
    column1,
    column2,
  }: {
    data: { [key: string]: number };
    column1: string;
    column2: string;
  }) => {
    return (
      <table
        style={{
          borderCollapse: 'collapse',
          width: '100%',
        }}
        border={0}
        cellSpacing={0}
        cellPadding={0}
      >
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '8px' }}>{column1}</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>{column2}</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(data).map(([key, value]) => {
            if (key === 'total') return undefined;
            const percentage = (value / data.total) * 100;
            return (
              <tr key={key}>
                <td style={{ padding: '8px', minWidth: '120px' }}>{key}</td>
                <td
                  style={{
                    padding: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  {numeral(value).format('0,0')}
                  <ProgressBar percentage={percentage} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }
);

export default Table;
