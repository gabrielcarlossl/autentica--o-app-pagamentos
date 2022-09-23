import React from 'react'
import If from '../operator/if'

export default props => (
    
    // teste para saber se esta escondido ou não

    <If test={!props.hide}> 
        <div className="form-group has-feedback">
            <input {...props.input}
                className='form-control'
                placeholder={props.placeholder}
                readOnly={props.readOnly}
                type={props.type} />
            <span className={`glyphicon glyphicon-${props.icon}
form-control-feedback`}></span>
        </div>
    </If>
)