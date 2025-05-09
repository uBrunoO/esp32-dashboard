// Credenciais MQTT e configuração
const MQTT_HOST = "832faee362a249b4929eeafa3ac41d6e.s1.eu.hivemq.cloud";
const MQTT_PORT = 8884; // Porta WebSocket segura
const MQTT_PATH = "/mqtt";
const MQTT_USER = "hivemq.webclient.1746800566955";
const MQTT_PASS = "K>2<FWaR9iO#7:3Hmvwb";

// Lista de cômodos
const rooms = ["Sala", "Cozinha", "Banheiro", "Lavabo", "Escada", "Garagem"];
let client;

// Função de login simples
document.getElementById("btnLogin").onclick = () => {
    const u = document.getElementById("user").value;
    const p = document.getElementById("pass").value;
    if (u === "admin" && p === "senha123") {
        document.getElementById("login").classList.add("hidden");
        initPanel();
    } else {
        alert("Usuário ou senha incorretos");
    }
};

// Inicializa painel e MQTT
function initPanel() {
    // Monta botões dos cômodos
    const container = document.getElementById("rooms");
    container.innerHTML = ""; // Limpa qualquer conteúdo prévio
    rooms.forEach(room => {
        const btn = document.createElement("button");
        btn.innerText = room;
        btn.className = "room-btn";
        btn.onclick = () => toggleRoom(room, btn);
        container.appendChild(btn);
    });

    document.getElementById("panel").classList.remove("hidden");

    // Cria e conecta o cliente MQTT via WebSocket
    client = new Paho.MQTT.Client(
        MQTT_HOST,
        Number(MQTT_PORT),
        MQTT_PATH,
        "web_" + parseInt(Math.random() * 1000)
    );

    client.onConnectionLost = (responseObject) => {
        if (responseObject.errorCode !== 0) {
            console.error("Conexão perdida:", responseObject.errorMessage);
        }
    };

    client.onMessageArrived = (message) => {
        console.log(`Mensagem recebida: ${message.destinationName} - ${message.payloadString}`);
    };

    client.connect({
        useSSL: true,
        userName: MQTT_USER,
        password: MQTT_PASS,
        onSuccess: () => {
            console.log("MQTT conectado com sucesso!");
            // Subscreve aos tópicos de status se quiser tratar feedback do ESP32
            rooms.forEach(room => {
                client.subscribe(`casa/${room}/status`);
            });
        },
        onFailure: (err) => {
            alert("Falha na conexão MQTT: " + err.errorMessage);
        }
    });
}

// Publica comando TOGGLE e muda estilo do botão
function toggleRoom(room, btn) {
    if (!client || !client.isConnected()) {
        alert("Ainda conectando ao broker...");
        return;
    }

    const topic = `casa/${room}/comando`;
    const message = new Paho.MQTT.Message("TOGGLE");
    message.destinationName = topic;
    client.send(message);
    btn.classList.toggle("active");
}
