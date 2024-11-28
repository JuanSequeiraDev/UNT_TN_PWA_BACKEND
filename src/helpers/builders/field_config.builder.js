export class FieldConfig {
    fieldConfig = {

    hayErrores: false
    }
    

    setNewField(field_name, value){
        this.fieldConfig[field_name] = {
            value: value,
            errors: [],
            validations: []
        }
        return this
    }
    setFieldValidations(field_name, validationsArr){
        this.fieldConfig[field_name].validations = validationsArr
        return this
    }
    validateFields(){
        for (let field_name in this.fieldConfig) {
            if(field_name === 'hayErrores'){ continue; }
            for (let validation of this.fieldConfig[field_name].validations) {
                let result = validation(field_name, this.fieldConfig[field_name].value)
                if (result) {
                    this.fieldConfig.hayErrores = true
                    this.fieldConfig[field_name].errors.push(result)
                }
            }
        }
        return this
    }
    build(){
        return this.fieldConfig
    }
}