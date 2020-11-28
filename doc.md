# Privoce - Api Gateway | Documentation

<div align="center">

![](preview.png)

</div>

## Models

### UserModel

| Key             | Type   | Required | Default |
| --------------- | ------ | -------- | ------- |
| nickname        | String | true     | N/A     |
| email           | String | true     | N/A     |
| password        | String | false    | ' '     |
| profileColor    | String | true     | N/A     |
| googleAuthToken | String | false    | ' '     |

## API

### Auth

#### `/auth/signin`

URL: `/auth/signin`

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

URL: `/auth/google`

Method: `GET`

Query Param:

```
?redirect={redirect url here}
```

Exemple: `https://.../auth/google?redirect=www.myfrontend.com/auth-token/`

Description: The redirect param is a url, that will used on callback to return the token, for exemple: `...?redirect=www.test.com/token` will be redirected to: `www.teste.com/token/2398a9sdjhkhasd`.

Response: No response, redirect url will be called when finish google auth.

#### `/auth/signup`

URL: `/auth/signup`

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

URL: `/auth/verify-email`

Method: `GET`

Query Param:

```
email={email here}
```

Exemple: `https://.../auth/verify-email?email=user@email.com`

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

URL: `/auth/me`

Method: `GET`

Authorization: `JWT Token`

Response:

Status Code: `200`

```typescript
{
  "token": string,
  "user": {
    "nickname": string,
    "email": string,
    "profileColor": string,
    "googleAuthToken": string,
    "_id": string,
    "__v": number
  }
}
```

Status Code: `401 | 500`

```typescript
{
  "success": false,
  "errors": {},
  "result": []
}
```

### User

#### /user/calendar

URL: `/user/calendar`

Method: `GET`

Authorization: `JWT Token`

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
