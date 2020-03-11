# API

## Me Endpoint

This endpoint will return if user is logged in or not

**Method**: GET

**Path**: /api/v1/users/me

**Headers**: `AUTORIZATION: YtD87Bd2SQCUIPbUB7xKiJ62SgE2xat4WRs4BJW0`

**Response**: 
 - 200


    {
        "data": {
          "id": 12,
          "name": "Andy Cho"
          "email": "andy.cho@mit.edu"
          ...
        }
    }

 - 401 
 
    
    {
        "data": {
            "googleUrl": "https://localhost/api/google/sso" // the url for Google sign in
        }
    }
    
---
## Login Endpoint

**Method**: POST

**Path**: /api/v1/users/login

**Payload**:

    {
        "email": "andy.cho@mit.edu"
        "passkey": "J62SgE2xat"
        "rememberMe": true
    }

**Response**: 
 - 200


    {
        data: {
          "id": 12,
          "name": "Andy Cho"
          "email": "andy.cho@mit.edu"
          ...
        }
    }

 - 401
 
    
    {
        "data": {
            "error": "Email and/or Passkey are wrong!" 
        }
    }
    
---
## Register Endpoint

**Method**: POST

**Path**: /api/v1/users/register

**Payload**:

    {
        "email": "andy.cho@mit.edu"
        "name": "Andy Cho"
    }

**Response**: 
 - 204 - success, no response is required
 - 400
 
 
    {
        data: {
            error: 'Error message' 
        }
    }

---
## Register Endpoint

**Method**: POST

**Path**: /api/v1/users/reset-passkey

**Payload**:

    {
        "email": "andy.cho@mit.edu"
    }

**Response**: 
 - 204 - this endpoint should return always 204 even if the email is not associated to any account, this will prevent brute force attacking and collecting the correct emails
 
