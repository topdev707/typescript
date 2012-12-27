// If you change anything in this enum, make sure you run SyntaxGenerator again!

enum SyntaxKind {
    None,
    List,
    SeparatedList,
    TriviaList,

    // Trivia
    WhitespaceTrivia,
    NewLineTrivia,
    MultiLineCommentTrivia,
    SingleLineCommentTrivia,
    SkippedTextTrivia,

    // Tokens
    IdentifierNameToken,

    // LiteralTokens
    RegularExpressionLiteral,
    NumericLiteral,
    StringLiteral,

    // Keywords
    BreakKeyword,
    CaseKeyword,
    CatchKeyword,
    ContinueKeyword,
    DebuggerKeyword,
    DefaultKeyword,
    DeleteKeyword,
    DoKeyword,
    ElseKeyword,
    FalseKeyword,
    FinallyKeyword,
    ForKeyword,
    FunctionKeyword,
    IfKeyword,
    InKeyword,
    InstanceOfKeyword,
    NewKeyword,
    NullKeyword,
    ReturnKeyword,
    SwitchKeyword,
    ThisKeyword,
    ThrowKeyword,
    TrueKeyword,
    TryKeyword,
    TypeOfKeyword,
    VarKeyword,
    VoidKeyword,
    WhileKeyword,
    WithKeyword,

    // FutureReservedWords.
    ClassKeyword,
    ConstKeyword,
    EnumKeyword,
    ExportKeyword,
    ExtendsKeyword,
    ImportKeyword,
    SuperKeyword,

    // FutureReservedStrictWords.
    ImplementsKeyword,
    InterfaceKeyword,
    LetKeyword,
    PackageKeyword,
    PrivateKeyword,
    ProtectedKeyword,
    PublicKeyword,
    StaticKeyword,
    YieldKeyword,

    // TypeScript keywords.
    AnyKeyword,
    BoolKeyword,
    ConstructorKeyword,
    DeclareKeyword,
    GetKeyword,
    ModuleKeyword,
    NumberKeyword,
    SetKeyword,
    StringKeyword,

    // Punctuators
    OpenBraceToken,
    CloseBraceToken,
    OpenParenToken,
    CloseParenToken,
    OpenBracketToken,
    CloseBracketToken,
    DotToken,
    DotDotDotToken,
    SemicolonToken,
    CommaToken,
    LessThanToken,
    GreaterThanToken,
    LessThanEqualsToken,
    GreaterThanEqualsToken,
    EqualsEqualsToken,
    EqualsGreaterThanToken,
    ExclamationEqualsToken,
    EqualsEqualsEqualsToken,
    ExclamationEqualsEqualsToken,
    PlusToken,
    MinusToken,
    AsteriskToken,
    PercentToken,
    PlusPlusToken,
    MinusMinusToken,
    LessThanLessThanToken,
    GreaterThanGreaterThanToken,
    GreaterThanGreaterThanGreaterThanToken,
    AmpersandToken,
    BarToken,
    CaretToken,
    ExclamationToken,
    TildeToken,
    AmpersandAmpersandToken,
    BarBarToken,
    QuestionToken,
    ColonToken,
    EqualsToken,
    PlusEqualsToken,
    MinusEqualsToken,
    AsteriskEqualsToken,
    PercentEqualsToken,
    LessThanLessThanEqualsToken,
    GreaterThanGreaterThanEqualsToken,
    GreaterThanGreaterThanGreaterThanEqualsToken,
    AmpersandEqualsToken,
    BarEqualsToken,
    CaretEqualsToken,
    SlashToken,
    SlashEqualsToken,

    ErrorToken,
    EndOfFileToken,

    // SyntaxNodes
    SourceUnit,

    // Names
    // IdentifierName,
    QualifiedName,

    // Types
    ObjectType,
    //PredefinedType,
    FunctionType,
    ArrayType,
    ConstructorType,

    // Module elements.
    InterfaceDeclaration,
    FunctionDeclaration,
    ModuleDeclaration,
    ClassDeclaration,
    EnumDeclaration,
    ImportDeclaration,

    // ClassElements
    MemberFunctionDeclaration,
    MemberVariableDeclaration,
    ConstructorDeclaration,
    GetMemberAccessorDeclaration,
    SetMemberAccessorDeclaration,

    // Type members.
    PropertySignature,
    CallSignature,
    ConstructSignature,
    IndexSignature,
    FunctionSignature,

    // Statements
    Block,
    IfStatement,
    VariableStatement,
    ExpressionStatement,
    ReturnStatement,
    SwitchStatement,
    BreakStatement,
    ContinueStatement,
    ForStatement,
    ForInStatement,
    EmptyStatement,
    ThrowStatement,
    WhileStatement,
    TryStatement,
    LabeledStatement,
    DoStatement,
    DebuggerStatement,
    WithStatement,

    // Expressions
    PlusExpression,
    NegateExpression,
    BitwiseNotExpression,
    LogicalNotExpression,
    PreIncrementExpression,
    PreDecrementExpression,
    DeleteExpression,
    TypeOfExpression,
    VoidExpression,
    //BooleanLiteralExpression,
    //NullLiteralExpression,
    //NumericLiteralExpression,
    //RegularExpressionLiteralExpression,
    //StringLiteralExpression,
    CommaExpression,
    AssignmentExpression,
    AddAssignmentExpression,
    SubtractAssignmentExpression,
    MultiplyAssignmentExpression,
    DivideAssignmentExpression,
    ModuloAssignmentExpression,
    AndAssignmentExpression,
    ExclusiveOrAssignmentExpression,
    OrAssignmentExpression,
    LeftShiftAssignmentExpression,
    SignedRightShiftAssignmentExpression,
    UnsignedRightShiftAssignmentExpression,
    ConditionalExpression,
    LogicalOrExpression,
    LogicalAndExpression,
    BitwiseOrExpression,
    BitwiseExclusiveOrExpression,
    BitwiseAndExpression,
    EqualsWithTypeConversionExpression,
    NotEqualsWithTypeConversionExpression,
    EqualsExpression,
    NotEqualsExpression,
    LessThanExpression,
    GreaterThanExpression,
    LessThanOrEqualExpression,
    GreaterThanOrEqualExpression,
    InstanceOfExpression,
    InExpression,
    LeftShiftExpression,
    SignedRightShiftExpression,
    UnsignedRightShiftExpression,
    MultiplyExpression,
    DivideExpression,
    ModuloExpression,
    AddExpression,
    SubtractExpression,
    PostIncrementExpression,
    PostDecrementExpression,
    MemberAccessExpression,
    InvocationExpression,
    //ThisExpression,
    ArrayLiteralExpression,
    ObjectLiteralExpression,
    ObjectCreationExpression,
    ParenthesizedExpression,
    ParenthesizedArrowFunctionExpression,
    SimpleArrowFunctionExpression,
    CastExpression,
    ElementAccessExpression,
    FunctionExpression,
    //SuperExpression,
    OmittedExpression,

    // Variable declarations
    VariableDeclaration,
    VariableDeclarator,

    // Lists
    ParameterList,
    ArgumentList,

    // Clauses
    ImplementsClause,
    ExtendsClause,
    EqualsValueClause,
    CaseSwitchClause,
    DefaultSwitchClause,
    ElseClause,
    CatchClause,
    FinallyClause,

    // Misc.
    Parameter,
    TypeAnnotation,
    SimplePropertyAssignment,
    ExternalModuleReference,
    ModuleNameModuleReference,
    GetAccessorPropertyAssignment,
    SetAccessorPropertyAssignment,

    FirstStandardKeyword = BreakKeyword,
    LastStandardKeyword = WithKeyword,

    FirstFutureReservedKeyword = ClassKeyword,
    LastFutureReservedKeyword = SuperKeyword,

    FirstFutureReservedStrictKeyword = ImplementsKeyword,
    LastFutureReservedStrictKeyword = YieldKeyword,

    FirstTypeScriptKeyword = AnyKeyword,
    LastTypeScriptKeyword = StringKeyword,

    FirstKeyword = FirstStandardKeyword,
    LastKeyword = LastTypeScriptKeyword,

    FirstToken = IdentifierNameToken,
    LastToken = EndOfFileToken,

    FirstPunctuation = OpenBraceToken,
    LastPunctuation = SlashEqualsToken,
}