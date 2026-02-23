using UnityEngine;

[RequireComponent(typeof(Rigidbody))]
public class PlayerMovement : MonoBehaviour
{
    [Header("Movement Settings")]
    public float moveSpeed = 6f;
    public float rotationSpeed = 10f;
    public float jumpForce = 5f;
    
    [Header("Ground Check")]
    [SerializeField] private LayerMask groundLayer = ~0; // Everything by default
    [SerializeField] private float groundCheckDistance = 0.2f;
    [SerializeField] private bool showGroundCheckGizmo = true;

    private Rigidbody rb;
    private Vector3 movementInput;
    private Transform cameraTransform;
    private bool isGrounded;

    [HideInInspector]
    public bool isInteractive = false;

    void Awake()
    {
        rb = GetComponent<Rigidbody>();
        cameraTransform = Camera.main.transform;
    }

    void Update()
    {
        if (!isInteractive) return;

        // Get input
        float horizontal = Input.GetAxis("Horizontal");
        float vertical = Input.GetAxis("Vertical");

        // Calculate camera-relative movement
        Vector3 forward = cameraTransform.forward;
        Vector3 right = cameraTransform.right;
        forward.y = 0f;
        right.y = 0f;
        forward.Normalize();
        right.Normalize();

        movementInput = (forward * vertical + right * horizontal);
        
        // Clamp magnitude to 1 to prevent faster diagonal movement
        if (movementInput.magnitude > 1f)
            movementInput.Normalize();

        // Jump
        if (Input.GetButtonDown("Jump") && isGrounded)
        {
            rb.AddForce(Vector3.up * jumpForce, ForceMode.Impulse);
        }

        // Optional: Debug input
        if (movementInput != Vector3.zero)
            Debug.DrawRay(transform.position + Vector3.up, movementInput * 2, Color.cyan);
    }

    void FixedUpdate()
    {
        if (!isInteractive) return;

        // Check if grounded
        isGrounded = Physics.Raycast(transform.position, Vector3.down, groundCheckDistance, groundLayer);

        // Apply movement
        if (movementInput != Vector3.zero)
        {
            Vector3 move = movementInput * moveSpeed * Time.fixedDeltaTime;
            rb.MovePosition(rb.position + move);

            // Smooth rotation to face movement direction
            Quaternion targetRotation = Quaternion.LookRotation(movementInput);
            rb.rotation = Quaternion.Slerp(rb.rotation, targetRotation, rotationSpeed * Time.fixedDeltaTime);
        }
    }

    // Called from JavaScript via SendMessage
    public void SetInteractive(string interactive)
    {
        if (bool.TryParse(interactive, out bool parsedBool))
        {
            isInteractive = parsedBool;
            Debug.Log($"Player interactive mode set to: {isInteractive}");
            
            // Optional: Handle cursor for WebGL
            #if UNITY_WEBGL && !UNITY_EDITOR
            if (isInteractive)
            {
                Cursor.lockState = CursorLockMode.Locked;
                Cursor.visible = false;
            }
            else
            {
                Cursor.lockState = CursorLockMode.None;
                Cursor.visible = true;
            }
            #endif
        }
    }

    // For debugging ground check
    void OnDrawGizmosSelected()
    {
        if (!showGroundCheckGizmo || !Application.isPlaying) return;
        
        Gizmos.color = isGrounded ? Color.green : Color.red;
        Gizmos.DrawRay(transform.position, Vector3.down * groundCheckDistance);
        
        // Draw a small sphere at the ground check point
        Gizmos.DrawWireSphere(transform.position + Vector3.down * groundCheckDistance, 0.05f);
    }
}