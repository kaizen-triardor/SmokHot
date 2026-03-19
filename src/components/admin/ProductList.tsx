import React from 'react'
import {
  List,
  Datagrid,
  TextField,
  NumberField,
  BooleanField,
  EditButton,
  DeleteButton,
  CreateButton,
  Toolbar,
  ChipField,
  FunctionField
} from 'react-admin'

const ProductToolbar = () => (
  <Toolbar>
    <CreateButton label="Dodaj novi sos" />
  </Toolbar>
)

const HeatLevelChip = ({ record }: any) => {
  const colors: { [key: string]: string } = {
    '1': '#98b83c', // Mild green
    '2': '#ffd400', // Warning yellow  
    '3': '#ff6a00', // Ember orange
    '4': '#e52421', // Fire red
    '5': '#cc1f1a', // Deep red
    '6': '#990000'  // Dark red
  }
  
  const labels: { [key: string]: string } = {
    '1': 'Blago',
    '2': 'Ljuto', 
    '3': 'Jako ljuto',
    '4': 'Pakleno',
    '5': 'Ekstremno',
    '6': 'Smrtonosno'
  }
  
  return (
    <ChipField
      record={record}
      source="heatLevel"
      style={{
        backgroundColor: colors[record.heatLevel] || '#666',
        color: 'white',
        fontWeight: 'bold'
      }}
      label={labels[record.heatLevel] || record.heatLevel}
    />
  )
}

const PriceField = ({ record }: any) => (
  <span style={{ fontWeight: 'bold', color: '#e52421' }}>
    {record.price} RSD
  </span>
)

const StockStatus = ({ record }: any) => {
  const inStock = record.inStock && record.stockCount > 0
  return (
    <span style={{
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '0.75rem',
      fontWeight: 'bold',
      backgroundColor: inStock ? '#98b83c' : '#cc1f1a',
      color: 'white'
    }}>
      {inStock ? `${record.stockCount} kom` : 'Nema na stanju'}
    </span>
  )
}

export const ProductList = () => (
  <List
    title="Ljuti sosovi"
    actions={<ProductToolbar />}
    perPage={25}
    sort={{ field: 'heatLevel', order: 'ASC' }}
  >
    <Datagrid>
      <TextField source="name" label="Naziv" />
      <FunctionField 
        label="Nivo ljutine" 
        render={(record: any) => <HeatLevelChip record={record} />}
      />
      <FunctionField 
        label="Cena" 
        render={(record: any) => <PriceField record={record} />}
      />
      <NumberField source="scoville" label="Scoville" />
      <TextField source="volume" label="Količina" />
      <FunctionField 
        label="Stanje" 
        render={(record: any) => <StockStatus record={record} />}
      />
      <BooleanField source="featured" label="Istaknuto" />
      <EditButton label="Uredi" />
      <DeleteButton label="Obriši" />
    </Datagrid>
  </List>
)