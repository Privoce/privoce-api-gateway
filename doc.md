## Model

### UserModel

| Key     | Type      | Required | Default |
|---------|-----------|----------|---------|
| nickname | String   | true    | N/A     |
| email | String | true   | N/A      |
| password | String | false    | ' '      |
| profileColor | String | true    | N/A      |
| googleAuthToken | String | false    | ' '      |

## API

### Auth

#### `/auth/signin`

URL:  `/auth/signin`

Method: `POST`

Param: 
```typescript
{
    "password" : string,
    "email" : string
}
```

Response:

Status Code: `200 | 400 | 500`

Cause: `success | Incorrect email or password | Internal Error`
```typescript
{
    "errors": []string,
    "success": boolean
}
```

#### `/auth/google`

URL:  `/auth/google`

Method: `GET`

#### `/auth/signup`

URL:  `/auth/signup`

Method: `POST`

Param: 
```typescript
{
    "password" : string,
    "email" : string,
    "confirmPassword": string,
    "nickname": string
}
```

Response:

Status Code: `200 | 400 | 500`

Cause: `success | Incorrect email or password | Internal Error`
```typescript
{
    "errors": {},
    "success": boolean,
    "token"?: string,
    "user"?: UserModel
}
```

#### `/auth/verify-email`

URL:  `/auth/verify-email`

Method: `GET`

Param: 
```
email=
```

Response:

Status Code: `200 | 400 | 500`

Cause: `success | email not found | Internal Error`

```typescript
{
    success: boolean,
    message: string,
}
```

#### `/auth/me`

URL:  `/auth/me`

@tulio some auth details. Helps are needed : P

### User

#### /user/calendar

URL:  `/user/calendar`

Method: `GET`

Response:

Status Code: `200 | 204`

```typescript
{
    success: boolean,
    events: []any,
}
```

Status Code: `401 | 500`

```typescript
{
    error: boolean,
    message: string,
}
```