using UnityEngine;

public class WebManager : MonoBehaviour
{

    void Start()
        {
            var obj = GameObject.Find("PlayerCustomizationManager");

            if (obj == null)
                Debug.Log("❌ PCM NOT FOUND");
            else
                Debug.Log("✅ PCM FOUND");
        }
    public void SetInteractive(string value)
    {
        bool interactive = value == "true";

        // Enable or disable player movement
        PlayerMovement player = FindObjectOfType<PlayerMovement>();
        if (player != null)
        {
            player.enabled = interactive;
        }

        // Optional: log for debugging
        Debug.Log("WebManager SetInteractive called: " + interactive);
    }
}