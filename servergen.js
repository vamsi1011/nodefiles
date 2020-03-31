var list = ['http://34.217.37.98:8129?skip=',
    'http://34.220.180.81:8129?skip=',
    'http://54.191.228.55:8129?skip=',
    'http://34.219.242.130:8129?skip=',
    'http://52.41.153.233:8129?skip=',
    'http://35.163.112.179:8129?skip=',
    'http://35.155.218.105:8129?skip=',
    'http://34.220.1.51:8129?skip=',
    'http://54.213.94.23:8129?skip=',
    'http://52.34.158.110:8129?skip=',
    'http://35.165.161.52:8129?skip=',
    'http://34.217.38.169:8129?skip=',
    'http://54.213.92.88:8129?skip=',
    'http://54.188.159.155:8129?skip=',
    'http://18.236.112.144:8129?skip=',
    'http://54.187.103.186:8129?skip=',
    'http://34.221.111.182:8129?skip=',
    'http://34.220.159.251:8129?skip=',
]

var division = Math.round(1345 / 18) + 1

for (let i = 0; i < 18; i++) {
    console.log(list[i] + (i * division) + "&limit=" + division + "&companyStatus=0")
}