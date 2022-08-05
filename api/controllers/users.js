const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const request = require('request');
const jwkToPem = require('jwk-to-pem');
const jwt = require('jsonwebtoken');

const poolData = {    
    UserPoolId : "us-east-1_WdXjBt3V1", // Your user pool id here    
    ClientId : "43e6mn5m2d083cbg3bjue0cojf" // Your client id here
}; 

const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

exports.user_signup = (req, res, next) => {
    var attributeList = [];
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:'name', Value:req.body.name}));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:'email', Value:req.body.email}));

    userPool.signUp(req.body.email, req.body.password, attributeList, null, (err, result) => {
        if (err) {
            return res.status(500).json({
                error: err
            });
        } else{
        cognitoUser = result.user;
        console.log(result);
        return res.status(201).json({
            message: 'Username is ' + cognitoUser.getUsername()
        });
        };
    });
};

exports.user_login = (req, res, next) => {
    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
        Username: req.body.email,
        Password: req.body.password,
    });

    var userData = {
        Username: req.body.email,
        Pool: userPool
    };

    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
            return res.status(200).json({
                AccessToken: result.getAccessToken().getJwtToken,
                IdToken: result.idToken.jwtToken,
                RefreshToken: result.getRefreshToken().getToken()
            });
        },
        onFailure: (err) => {
            return res.status(500).json({
                error: err
            });
        }
    });
};

exports.user_update = (req, res, next) => {
    var attributeList = [];
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:'name', Value:req.body.name}));

    var userData = {
        Username: req.body.email,
        Pool: userPool
    };

    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    cognitoUser.updateAttributes(attributeList, (err, result) => {
        if (err) {
            return res.status(500).json({
                error: err
            });
        } else {
            return res.status(200).json({
                result: result
            });
        }
    });
};

exports.user_verify = (req, res, next) => {
    request({
        url: `https://cognito-idp.${process.env.AWS_DEFAULT_REGION}.amazonaws.com/${poolData.UserPoolId}/.well-known/jwks.json`,
        json: true
    }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
        var pems = {};
        var keys = body['keys'];
        for(var i = 0; i < keys.length; i++) {
            var key_id = keys[i].kid;
            var modulus = keys[i].n;
            var exponent = keys[i].e;
            var key_type = keys[i].kty;
            var jwk = {kty: key_type, n: modulus, e: exponent};
            var pem = jwkToPem(jwk);
            pems[key_id] = pem;
        }
        var decodedJwt = jwt.decode(req.params.token, {complete: true});
        if (!decodedJwt) {
            return res.status(401).json({
                message: 'Auth Failed'
            });
        }

        var kid = decodedJwt.header.kid;
        var pem = pems[kid];
        if (!pem) {
            return res.status(401).json({
                message: 'Auth Failed'
            });
        }

        jwt.verify(req.params.token, pem, (err, payload) => {
            if (err) {
                return res.status(401).json({
                    message: 'Auth Failed'
                });
            } else {
                return res.status(200).json({
                    result: payload
                });
            }
        });
        } else {
            return res.status(502).json({
                message: 'Unable to download JWKs'
            });
        }
   });
};

exports.user_refresh = (req, res, next) => {
    const RefreshToken = new AmazonCognitoIdentity.CognitoRefreshToken({RefreshToken: req.params.token});

    var userData = {
        Username: req.body.email,
        Pool: userPool
    };

    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    cognitoUser.refreshSession(RefreshToken, (err, session) => {
        if (err) {
            return res.status(500).json({
                error: err
            });
        } else {
            let retObj = {
                "access_token": session.accessToken.jwtToken,
                "id_token": session.idToken.jwtToken,
                "refresh_token": session.refreshToken.token,
            }
            return res.status(200).json({
                AccessToken: session.accessToken.jwtToken,
                IdToken: session.idToken.jwtToken,
                RefreshToken: session.refreshToken.token
            });
        }
    });
};

exports.user_delete = (req, res, next) => {
    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
        Username: req.body.email,
        Password: req.body.password,
    });

    var userData = {
        Username: req.body.email,
        Pool: userPool
    };

    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
            cognitoUser.deleteUser((err, result) => {
                if (err) {
                    return res.status(500).json({
                        error: err
                    });
                } else {
                    return res.status(200).json({
                        result: result
                    });
                }
            });
        },
        onFailure: (err) => {
            return res.status(500).json({
                error: err
            });
        }
    });
};

exports.user_update_password = (req, res, next) => {
    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
        Username: req.body.email,
        Password: req.body.password,
    });

    var userData = {
        Username: req.body.email,
        Pool: userPool
    };

    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);authenticationDetails
    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: () => {
            cognitoUser.changePassword(req.body.password, req.body.newpassword, (err, result) => {
                if (err) {
                    return res.status(500).json({
                        error: err
                    });
                } else {
                    return res.status(200).json({
                        result: result
                    });
                }
            });
        },
        onFailure: (err) => {
            return res.status(500).json({
                error: err
            });
        }
    });
};