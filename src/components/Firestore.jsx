import React, {useState} from 'react';
import {db} from '../firebase';
import moment from 'moment';
import 'moment/locale/es';

const Firestore = (props) => {

  const [tareas, setTareas] = useState([])
  const [tarea,setTarea] = useState('')
  const [modoEdicion, setModoEdicion] = useState(false)
  const [id, setId] = useState('')

  // states para el botón de "siguiente..."
  const [ultimo, setUltimo] = useState(null)
  const [desactivar, setDesactivar] = useState(false)

  React.useEffect(() => {
    const obtenerDatos = async () => {
      try {
        setDesactivar(true)

        const data = await db.collection(props.user.uid).limit(2).orderBy('fecha', 'desc').get()

        //...doc.data porque es otro objeto y así no se crean objetos dentro del array
        const arrayData = data.docs.map(doc => ({id : doc.id, ...doc.data() }))


        setUltimo(data.docs[data.docs.length - 1])
        setTareas(arrayData)

        const query = await db.collection(props.user.uid).limit(2)
          .orderBy('fecha', 'desc').startAfter(data.docs[data.docs.length - 1]).get()

        if (query.empty) {
          setDesactivar(true)
        } else {
          setDesactivar(false)
        }

      } catch (error) {
        console.log(error)
      }
    }

    obtenerDatos()
  }, [props.user.uid])

  const agregar = async (e) => {
    e.preventDefault()
    

    if (!tarea.trim()) {
      console.log('elemento vacío')
      return
    }

    try {
      
      const nuevaTarea ={
        name : tarea,
        fecha : Date.now()
      }

      //función que añade en db
      const data = await db.collection(props.user.uid).add(nuevaTarea)

      //actualizamos tareas para que salga en pantalla la nueva tarea
      setTareas([
        ...tareas,
        {...nuevaTarea, id : data.id}
      ])

      //vaciamos campo tarea
      setTarea('')

    } catch (error) {
      console.log(error)
    }
  }


  const eliminar = async (id) => {
    try {
    
      await db.collection(props.user.uid).doc(id).delete()


      const arrayFilter = tareas.filter(item => item.id !== id)
      setTareas(arrayFilter)


    } catch (error) {
      console.log(error)
    }
  }

  const activarEdicion = (item) => {
    setModoEdicion(true)
    setTarea(item.name)
    setId(item.id)
  }

  const editar = async (e) => {
    e.preventDefault()

    if (!tarea.trim()) {
      console.log('elemento vacío')
      return
    }

    try {
      
      await db.collection(props.user.uid).doc(id).update({
        name : tarea
      })

      const arrayEditado = tareas.map(item => (
        item.id === id ? {id : item.id, fecha : item.fecha, name : tarea} : item
      ))

      setTareas(arrayEditado)
      setModoEdicion(false)
      setTarea('')
      setId('')

    } catch (error) {
      console.log(error)
    }
  }

  const siguiente = async () => {
    try {
      const data = await db.collection(props.user.uid).limit(2).orderBy('fecha', 'desc').startAfter(ultimo).get()

      const arrayData = data.docs.map(doc => ({id : doc.id, ...doc.data() }))
      setTareas([
        ...tareas, ...arrayData
      ])

      setUltimo(data.docs[data.docs.length - 1])

      const query = await db.collection(props.user.uid).limit(2)
          .orderBy('fecha', 'desc').startAfter(data.docs[data.docs.length - 1]).get()

        if (query.empty) {
          console.log('No hay más notas')
          setDesactivar(true)
        } else {
          setDesactivar(false)
        }

    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="container mt-3">
      <div className="row">
        <div className="col-md-6">
          <ul className="list-group">
            {
              tareas.map(item => (
                <li className="list-group-item" key={item.id}>
                  {item.name} - {moment(item.fecha).format('lll')}
                  <button className="btn btn-danger btn-sm float-right ml-2" onClick={() => eliminar(item.id)}>Eliminar</button>
                  <button className="btn btn-warning btn-sm float-right" onClick={() => activarEdicion(item)}>Editar</button>
                </li>
              ))
            }
          </ul>
          <button className="btn btn-info btn-block mt-2 btn-sm"
          onClick={() => siguiente()}
          disabled={desactivar}> 
            Siguiente...
          </button>
        </div>
        <div className="col-md-6">
          <h3>
            {
              modoEdicion ? 'Editar tarea' : 'Agregar tarea'
            }
          </h3>
          <form onSubmit={modoEdicion ? editar : agregar}>
            <input 
            type="text"
            placeholder={modoEdicion ? 'Edita la tarea' : 'Agrega una tarea'}
            className="form-control mb-2"
            onChange={e => setTarea(e.target.value)}
            value={tarea}
            />

            <button className={
              modoEdicion ? 'btn btn-warning btn-block' : 'btn btn-dark btn-block'
            } type="submit">
              {
                modoEdicion ? 'Editar' : 'Añadir'
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Firestore;
