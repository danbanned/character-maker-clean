using UnityEngine;
using UnityEngine.SceneManagement;

public class LobbyUIManager : MonoBehaviour
{
    public void ExitLobby()
    {
        SceneManager.LoadScene("MainMenu");
    }
}