import React from 'react'
import {
  Edit,
  SimpleForm,
  TextInput,
  NumberInput,
  BooleanInput,
  SelectInput,
  ArrayInput,
  SimpleFormIterator,
  required,
  minValue,
  maxValue
} from 'react-admin'

const heatLevelChoices = [
  { id: 1, name: '1 - Blago' },
  { id: 2, name: '2 - Ljuto' },
  { id: 3, name: '3 - Jako ljuto' },
  { id: 4, name: '4 - Pakleno' },
  { id: 5, name: '5 - Ekstremno' },
  { id: 6, name: '6 - Smrtonosno' },
]

export const ProductEdit = () => (
  <Edit title="Uredi ljuti sos">
    <SimpleForm>
      <TextInput 
        source="name" 
        label="Naziv proizvoda" 
        validate={[required()]}
        fullWidth
      />
      
      <TextInput 
        source="slug" 
        label="URL naziv (slug)" 
        validate={[required()]}
        fullWidth
        helperText="URL-friendly naziv (npr. gecko-mild)"
      />
      
      <TextInput 
        source="blurb" 
        label="Kratak opis" 
        multiline 
        rows={2}
        fullWidth
        helperText="Kratka rečenica za kartice proizvoda"
      />
      
      <TextInput 
        source="description" 
        label="Detaljan opis" 
        multiline 
        rows={4}
        fullWidth
        helperText="Potpun opis proizvoda"
      />
      
      <SelectInput 
        source="heatLevel" 
        label="Nivo ljutine" 
        choices={heatLevelChoices}
        validate={[required()]}
      />
      
      <NumberInput 
        source="heatNumber" 
        label="Redni broj ljutine"
        validate={[required(), minValue(1), maxValue(6)]}
        helperText="1-6 za sortiranje po ljutini"
      />
      
      <NumberInput 
        source="price" 
        label="Cena (RSD)" 
        validate={[required(), minValue(0)]}
        step={10}
      />
      
      <NumberInput 
        source="originalPrice" 
        label="Originalna cena (opciono)" 
        step={10}
        helperText="Za prikazivanje sniženja"
      />
      
      <NumberInput 
        source="scoville" 
        label="Scoville jedinice"
        validate={[required(), minValue(0)]}
        step={500}
      />
      
      <TextInput 
        source="volume" 
        label="Količina" 
        validate={[required()]}
        helperText="npr. 150ml"
      />
      
      <NumberInput 
        source="stockCount" 
        label="Broj na stanju"
        validate={[required(), minValue(0)]}
      />
      
      <BooleanInput 
        source="inStock" 
        label="Dostupno za prodaju"
      />
      
      <BooleanInput 
        source="featured" 
        label="Istakni na početnoj strani"
      />
      
      <ArrayInput source="ingredients" label="Sastojci">
        <SimpleFormIterator>
          <TextInput source="" label="Sastojak" />
        </SimpleFormIterator>
      </ArrayInput>
      
      <ArrayInput source="pairings" label="Kombinacije sa hranom">
        <SimpleFormIterator>
          <TextInput source="" label="Kombinacija" />
        </SimpleFormIterator>
      </ArrayInput>
      
      <ArrayInput source="categories" label="Kategorije">
        <SimpleFormIterator>
          <TextInput source="" label="Kategorija" />
        </SimpleFormIterator>
      </ArrayInput>
    </SimpleForm>
  </Edit>
)