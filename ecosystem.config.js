module.exports = {
    apps: [{
        name: 'autov2',
        script: 'src/server.js',
        watch: true,
        exec_mode: "fork_mode",
        instances: 1,
        autorestart: true,
        node_args: "--presets @babel/preset-env",
        env: {
            PORT: 8080,
            ACCESS_TOKEN: "abc",
            APP_ID: "580996410463386537",
            OA_SECRET_KEY: "abc",
            BOT_TOKEN: "6287309426:AAE82kG-sMV8fd54oFIMsk87ZeogOy40Ur8",
            usernameNLTB: "52001",
            passwordNLTB: "hRmqcv5&",
            hostnameNLTB: "117.1.28.135",
            usernameLocalNLTB: "tcdbvn",
            passwordLocalNLTB: "@tcdbvn",
            hostnameLocal: "http://117.2.131.102:7782",
            id_groupNLTB: "-867445996",
            tokenNLTB: "eyJhbGciOiJIUzUxMiJ9.eyJqdGkiOiI1M2JkOTBhNi1lNGNjLTQ0N2QtOGNmYy1mOTk0MDk3ODc3NDQiLCJzdWIiOiI1MjAwMSIsImFjY291bnRUeXBlIjoiUk9MRV9UUkFJTklOR19VTklUUyIsImF1dGgiOiJkYXNoYm9hcmQ6dmlldyxyZXBvcnRfc3R1ZGVudF9wcm9ncmVzczp2aWV3LHJlcG9ydF9zdHVkZW50X3Byb2dyZXNzOmV4cG9ydCxyZXBvcnRfc3R1ZGVudF9zZXNzaW9uOnZpZXcscmVwb3J0X3N0dWRlbnRfc2Vzc2lvbjpleHBvcnQscmVwb3J0X2NvbXBsZXRpb25fc3RhdGlzdGljOnZpZXcscmVwb3J0X2NvbXBsZXRpb25fc3RhdGlzdGljOmV4cG9ydCxkYXRhX3ZlaGljbGU6dmlldyxkYXRhX3ZlaGljbGU6ZXhwb3J0LGRhdGFfY291cnNlOnZpZXcsZGF0YV9jb3Vyc2U6ZXhwb3J0LGRhdGFfc3R1ZGVudDp2aWV3LGRhdGFfc3R1ZGVudDpleHBvcnQsZGF0YV90dXRvcjp2aWV3LGRhdGFfdHV0b3I6ZXhwb3J0LHN5c3RlbV9ub3RpZmljYXRpb25zOnZpZXcsc2Vzc2lvbl9tYW5hZ2VtZW50OnZpZXcsc2Vzc2lvbl9tYW5hZ2VtZW50OmV4cG9ydCIsImV4cCI6MTY4NjIzMjA0OX0.HoPyHEMeNcJrGHeMDc9clfoAGIOMUfPUxY-T5vOpRzjk_xiehjXBxzAn5CMjl5AtAmy7QP8-5bOhNRSh5jXy3A",
            "tokenLocalNLTB": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6InRjZGJ2biIsImVtYWlsIjoidXNlckB5b3BtYWlsLmNvbSIsIkRpc3BsYXlOYW1lIjoiVXNlciIsInJvbGUiOiJhZG1pbiIsIk1hRHYiOiI5OSIsIm5iZiI6MTY4MzYzNDcwNiwiZXhwIjoxNjgzNzIxMTA2LCJpYXQiOjE2ODM2MzQ3MDYsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6Nzc4MiIsImF1ZCI6Imh0dHA6Ly9sb2NhbGhvc3Q6NDAwIn0.b4kHgEw79PGjkMHGlPSlh2nvzXcbs6jsfyjTUl_eLco"

        }
    }]
}
