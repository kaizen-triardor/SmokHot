import { DataProvider } from 'react-admin'

// Custom data provider for React Admin with authentication
export const adminDataProvider: DataProvider = {
  getList: async (resource, params) => {
    const { page, perPage } = params.pagination
    const { field, order } = params.sort
    
    const query = new URLSearchParams({
      _start: ((page - 1) * perPage).toString(),
      _end: (page * perPage).toString(),
      _sort: field,
      _order: order,
    })
    
    // Add filter params if any
    if (params.filter) {
      Object.keys(params.filter).forEach(key => {
        query.append(key, params.filter[key])
      })
    }
    
    const token = localStorage.getItem('admin-token')
    const response = await fetch(`/api/admin/${resource}?${query}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    const total = parseInt(response.headers.get('X-Total-Count') || '0')
    
    return {
      data,
      total,
    }
  },

  getOne: async (resource, params) => {
    const token = localStorage.getItem('admin-token')
    const response = await fetch(`/api/admin/${resource}/${params.id}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return { data }
  },

  getMany: async (resource, params) => {
    const token = localStorage.getItem('admin-token')
    const queries = params.ids.map(id => 
      fetch(`/api/admin/${resource}/${id}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      }).then(response => response.json())
    )
    
    const data = await Promise.all(queries)
    return { data }
  },

  getManyReference: async (resource, params) => {
    const { page, perPage } = params.pagination
    const { field, order } = params.sort
    
    const query = new URLSearchParams({
      _start: ((page - 1) * perPage).toString(),
      _end: (page * perPage).toString(),
      _sort: field,
      _order: order,
      [params.target]: params.id.toString(),
    })
    
    const token = localStorage.getItem('admin-token')
    const response = await fetch(`/api/admin/${resource}?${query}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    const total = parseInt(response.headers.get('X-Total-Count') || '0')
    
    return { data, total }
  },

  update: async (resource, params) => {
    const token = localStorage.getItem('admin-token')
    const response = await fetch(`/api/admin/${resource}/${params.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params.data),
    })
    
    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`)
    }
    
    const data = await response.json()
    return { data }
  },

  updateMany: async (resource, params) => {
    const token = localStorage.getItem('admin-token')
    const queries = params.ids.map(id => 
      fetch(`/api/admin/${resource}/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params.data),
      }).then(response => response.json())
    )
    
    const data = await Promise.all(queries)
    return { data: params.ids }
  },

  create: async (resource, params) => {
    const token = localStorage.getItem('admin-token')
    const response = await fetch(`/api/admin/${resource}`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params.data),
    })
    
    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`)
    }
    
    const data = await response.json()
    return { data }
  },

  delete: async (resource, params) => {
    const token = localStorage.getItem('admin-token')
    const response = await fetch(`/api/admin/${resource}/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return { data: params.previousData }
  },

  deleteMany: async (resource, params) => {
    const token = localStorage.getItem('admin-token')
    const queries = params.ids.map(id => 
      fetch(`/api/admin/${resource}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      })
    )
    
    await Promise.all(queries)
    return { data: params.ids }
  },
}