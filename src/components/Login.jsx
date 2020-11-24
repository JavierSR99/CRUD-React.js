import React from 'react';
import {auth, db} from '../firebase';
import {withRouter} from 'react-router-dom';

const Login = (props) => {

    const [email, setEmail] = React.useState('')
    const [pass, setPass] = React.useState('')
    const [error, setError] = React.useState(null)
    const [esRegistro, setEsRegistro] = React.useState(true)

    /**
     * valida los campos del formulario
     * @param {*} e 
     */
    const procesarDatos = (e) => {
        e.preventDefault() //para que no haga el get por defecto

        if (!email.trim()) {
            setError('Escribe un email')
            return
        }
        if (!pass.trim()) {
            setError('Escribe una contraseña')
            return
        }

        if (pass.length < 6) {
            setError('La contraseña debe tener un mínimo de 6 caracteres')
            return
        }
        setError(null)

        if (esRegistro) {
            registrar()
        } else {
            login()
        }
    }

    /**
     * realiza el inicio de sesión con firebase
     */
    const login = React.useCallback(async () => {
        try {
            await auth.signInWithEmailAndPassword(email,pass)
            
            setEmail('')
            setPass('')
            setError(null)

            props.history.push('/admin') //empuja al usuario a otra ruta
            
        } catch (error) {
            if (error.code === 'auth/invalid-email') {
                setError('Email inválido :(')
            }
            if (error.code === 'auth/user-not-found') {
                setError('El email introducido no tiene cuenta asociada :(')
            }
            if (error.code === 'auth/wrong-password') {
                setError('Contraseña incorrecta :(')
            }
        }
    }, [email,pass, props.history]) 

    /**
     * llama a firebase para realizar el registro de usuario
     */
    const registrar = React.useCallback (async () => {
        try {
            //la función es de firebase y realiza el registro/fallo
            const res = await auth.createUserWithEmailAndPassword(email, pass)
            await db.collection('usuarios').doc(res.user.email).set({
                email : res.user.email,
                uid : res.user.uid
            })

            await db.collection(res.user.uid).add({
                name : 'Bienvenido :)',
                fecha : Date.now()
            })

            

            setEmail('')
            setPass('')
            setError(null)
            props.history.push('/admin')

        } catch (error) {
            if (error.code === 'auth/invalid-email') {
                setError('El email introducido es inválido :(')
            }
            if (error.code === 'auth/email-already-in-use') {
                setError('Email ya utilizado :((')
            }
            
        }
    }, [email, pass, props.history])

    return (
        <div className="mt-3">
            <h3 className="text-center">
                {
                    esRegistro ? 'Registro' : 'Inicia sesión'
                }
            </h3>

            <hr/>

            <div className="row justify-content-center">
                <div className="col-12 col-sm-8 col-md-6 col-xl-4">
                    <form onSubmit={procesarDatos}>
                        
                        {
                            error && (
                                <div className="alert alert-danger">
                                    {error}
                                </div>
                            )
                        }
                        <input 
                        type="email" 
                        className="form-control mb-2"
                        placeholder="Escribe tu email"
                        onChange={e => setEmail(e.target.value)}
                        value={email}
                        />
                        <input 
                        type="password" 
                        className="form-control mb-2"
                        placeholder="Escribe tu contraseña"
                        onChange={e => setPass(e.target.value)}
                        value={pass}
                        />
                        <button className="btn btn-dark btn-lg btn-block" type="submit">
                            {
                                esRegistro ? 'Registrarse' : 'Entrar'
                            }
                        </button>
                        <button type="button" className="btn btn-info btn-sm btn-block" onClick={() => setEsRegistro(!esRegistro)}>
                            {
                                esRegistro ? '¿Ya estás registrado?' : '¿No tienes cuenta?'
                            }
                        </button>
                        {
                            !esRegistro ? (
                                <button className="btn btn-danger btn-sm btn-block" type="button" 
                                onClick={() => props.history.push('/reset')}>
                                    Recuperar contraseña
                                </button>
                            ) : null
                        }
                        
                    </form>
                </div>
            </div>
        </div>
    )
}

export default withRouter(Login)
